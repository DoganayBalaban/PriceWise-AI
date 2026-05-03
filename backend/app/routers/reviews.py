import json
import uuid
from typing import AsyncGenerator

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.repositories.review_repository import ReviewRepository
from app.repositories.product_repository import ProductRepository
from app.services.embedding_service import query_similar_chunks

router = APIRouter()


class AskRequest(BaseModel):
    question: str


def _parse_uuid(value: str) -> uuid.UUID:
    try:
        return uuid.UUID(value)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid product ID")


@router.get("/{product_id}")
async def get_reviews(
    product_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    pid = _parse_uuid(product_id)
    repo = ReviewRepository(db)
    reviews = await repo.list_by_product(pid)
    embedded_count = sum(1 for r in reviews if r.pinecone_id)
    return {
        "total": len(reviews),
        "embedded": embedded_count,
        "rag_ready": embedded_count >= 5,
        "reviews": [
            {
                "id": str(r.id),
                "content": r.content,
                "rating": r.rating,
                "review_date": str(r.review_date) if r.review_date else None,
                "verified": r.verified,
            }
            for r in reviews[:20]  # preview only
        ],
    }


@router.post("/{product_id}/ask")
async def ask_reviews(
    product_id: str,
    body: AskRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> StreamingResponse:
    pid = _parse_uuid(product_id)

    # Make sure product exists and user tracks it
    product_repo = ProductRepository(db)
    product = await product_repo.get_by_id(pid)
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    if not await product_repo.is_tracked_by_user(pid, current_user.id):
        raise HTTPException(status_code=403, detail="Bu ürün takip listenizde değil")

    # Check reviews exist
    review_repo = ReviewRepository(db)
    count = await review_repo.count_by_product(pid)
    if count == 0:
        raise HTTPException(
            status_code=422,
            detail="Bu ürün için henüz yorum yok. Lütfen birkaç dakika bekleyin.",
        )

    question = body.question.strip()
    if not question:
        raise HTTPException(status_code=400, detail="Soru boş olamaz")

    return StreamingResponse(
        _rag_stream(question, pid, product.name or "bu ürün"),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )


async def _rag_stream(
    question: str,
    product_id: uuid.UUID,
    product_name: str,
) -> AsyncGenerator[str, None]:
    from openai import AsyncOpenAI
    from app.core.config import settings

    def _sse(data: dict) -> str:
        return f"data: {json.dumps(data, ensure_ascii=False)}\n\n"

    # Retrieve top-5 similar chunks from Pinecone
    try:
        chunks = await query_similar_chunks(question, product_id, top_k=5)
    except Exception as exc:
        yield _sse({"type": "error", "message": f"Arama hatası: {exc}"})
        return

    if not chunks:
        yield _sse({
            "type": "error",
            "message": "Yorumlar henüz indekslenmemiş. Lütfen birkaç dakika sonra tekrar deneyin.",
        })
        return

    # Build context from retrieved chunks
    context_parts = []
    for i, chunk in enumerate(chunks, 1):
        rating_str = f"Puan: {chunk['rating']}/5 — " if chunk.get("rating") else ""
        date_str = f"Tarih: {chunk['review_date']} — " if chunk.get("review_date") else ""
        context_parts.append(f"[Yorum {i}] {rating_str}{date_str}{chunk['text']}")
    context = "\n\n".join(context_parts)

    prompt = f"""Sen {product_name} ürünü hakkında müşteri yorumlarını analiz eden bir asistansın.
Aşağıda bu ürüne ait gerçek müşteri yorumlarından seçilmiş bölümler var:

{context}

Kullanıcının sorusu: {question}

Yalnızca yukarıdaki yorumlara dayanarak Türkçe cevap ver. Eğer yorumlarda bu soruya cevap yoksa bunu açıkça belirt. Uydurma."""

    client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

    try:
        stream = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            stream=True,
            temperature=0.3,
            max_tokens=600,
        )

        async for event in stream:
            delta = event.choices[0].delta
            if delta.content:
                yield _sse({"type": "chunk", "text": delta.content})

    except Exception as exc:
        yield _sse({"type": "error", "message": f"Yanıt üretme hatası: {exc}"})
        return

    # Send source chunks after the answer
    yield _sse({
        "type": "sources",
        "sources": [
            {
                "text": c["text"],
                "rating": c.get("rating"),
                "review_date": c.get("review_date"),
                "score": round(c.get("score", 0), 3),
            }
            for c in chunks
        ],
        "total_reviews_used": len(chunks),
    })
    yield _sse({"type": "done"})

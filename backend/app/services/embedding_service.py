"""
Embedding pipeline: review chunks → OpenAI embeddings → Pinecone upsert.

Vector ID format : {review_id}_{chunk_index}
Metadata stored  : product_id, review_id, chunk_index, text, rating, review_date, platform
reviews.pinecone_id is set to the first chunk ID ({review_id}_0) once embedded.
"""
import logging
import uuid
from typing import Any

from langchain_text_splitters import RecursiveCharacterTextSplitter
from openai import AsyncOpenAI
from pinecone import Pinecone

from app.core.config import settings
from app.models.review import Review

logger = logging.getLogger(__name__)

EMBED_MODEL = "text-embedding-3-small"
EMBED_DIM = 1536
CHUNK_SIZE = 256        # tokens
CHUNK_OVERLAP = 32      # tokens
UPSERT_BATCH = 100      # vectors per Pinecone upsert call


def _get_pinecone_index():
    pc = Pinecone(api_key=settings.PINECONE_API_KEY)
    return pc.Index(settings.PINECONE_INDEX)


def _splitter() -> RecursiveCharacterTextSplitter:
    return RecursiveCharacterTextSplitter.from_tiktoken_encoder(
        model_name="text-embedding-3-small",
        chunk_size=CHUNK_SIZE,
        chunk_overlap=CHUNK_OVERLAP,
    )


async def embed_texts(texts: list[str]) -> list[list[float]]:
    client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
    response = await client.embeddings.create(model=EMBED_MODEL, input=texts)
    return [item.embedding for item in response.data]


async def embed_and_upsert_reviews(
    reviews: list[Review],
    platform: str,
    product_id: uuid.UUID,
) -> list[str]:
    """
    Chunk, embed, and upsert a list of Review objects.
    Returns list of review IDs that were successfully embedded.
    """
    if not reviews:
        return []

    if not settings.OPENAI_API_KEY or not settings.PINECONE_API_KEY:
        logger.warning("OPENAI_API_KEY or PINECONE_API_KEY not configured — skipping embedding")
        return []

    splitter = _splitter()
    index = _get_pinecone_index()

    vectors: list[dict[str, Any]] = []
    review_chunk_map: dict[str, list[int]] = {}  # review_id → chunk indices in `vectors`

    for review in reviews:
        chunks = splitter.split_text(review.content)
        if not chunks:
            continue
        review_id_str = str(review.id)
        review_chunk_map[review_id_str] = list(range(len(vectors), len(vectors) + len(chunks)))
        for idx, chunk in enumerate(chunks):
            meta: dict = {
                "product_id": str(product_id),
                "review_id": review_id_str,
                "chunk_index": idx,
                "text": chunk,
                "platform": platform,
                "review_date": str(review.review_date) if review.review_date else "",
            }
            if review.rating is not None:
                meta["rating"] = review.rating
            vectors.append({"id": f"{review_id_str}_{idx}", "text": chunk, "metadata": meta})

    if not vectors:
        return []

    # Embed in batches of 100 (OpenAI input limit)
    all_embeddings: list[list[float]] = []
    for i in range(0, len(vectors), 100):
        batch_texts = [v["text"] for v in vectors[i : i + 100]]
        try:
            embeddings = await embed_texts(batch_texts)
            all_embeddings.extend(embeddings)
        except Exception as exc:
            logger.error("Embedding API error at batch %d: %s", i // 100, exc)
            raise

    # Upsert to Pinecone in batches
    pinecone_vectors = [
        {
            "id": v["id"],
            "values": emb,
            "metadata": v["metadata"],
        }
        for v, emb in zip(vectors, all_embeddings)
    ]

    for i in range(0, len(pinecone_vectors), UPSERT_BATCH):
        batch = pinecone_vectors[i : i + UPSERT_BATCH]
        index.upsert(vectors=batch)
        logger.debug("Upserted %d vectors to Pinecone", len(batch))

    # Return review IDs that got at least one chunk embedded
    return list(review_chunk_map.keys())


async def query_similar_chunks(
    question: str,
    product_id: uuid.UUID,
    top_k: int = 5,
) -> list[dict[str, Any]]:
    """Embed the question and return top-k similar chunks from Pinecone."""
    if not settings.OPENAI_API_KEY or not settings.PINECONE_API_KEY:
        return []

    embeddings = await embed_texts([question])
    query_vector = embeddings[0]

    index = _get_pinecone_index()
    results = index.query(
        vector=query_vector,
        top_k=top_k,
        filter={"product_id": {"$eq": str(product_id)}},
        include_metadata=True,
    )

    return [
        {
            "text": match.metadata.get("text", ""),
            "score": match.score,
            "review_id": match.metadata.get("review_id", ""),
            "rating": match.metadata.get("rating"),
            "review_date": match.metadata.get("review_date", ""),
            "platform": match.metadata.get("platform", ""),
        }
        for match in results.matches
    ]

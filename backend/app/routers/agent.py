import json
import logging
import uuid
from typing import AsyncGenerator

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.cache import get_cached_agent_decision, set_cached_agent_decision
from app.core.database import AsyncSessionLocal, get_db
from app.core.redis import get_redis
from app.core.security import get_current_user
from app.models.user import User
from app.repositories.analysis_history_repository import AnalysisHistoryRepository
from app.repositories.product_repository import ProductRepository

router = APIRouter()
logger = logging.getLogger(__name__)

_NODE_DISPLAY: dict[str, str] = {
    "price_analyst_node": "price_analyst",
    "review_rag_node": "review_rag",
    "decision_node": "decision",
}
_NODE_INDEX: dict[str, int] = {name: i for i, name in enumerate(_NODE_DISPLAY)}
_NODE_ORDER = list(_NODE_DISPLAY.keys())


def _parse_uuid(value: str) -> uuid.UUID:
    try:
        return uuid.UUID(value)
    except ValueError:
        raise HTTPException(status_code=400, detail="Geçersiz ID")


@router.post("/analyze/{product_id}")
async def analyze_product(
    product_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> StreamingResponse:
    pid = _parse_uuid(product_id)

    product_repo = ProductRepository(db)
    product = await product_repo.get_by_id(pid)
    if product is None:
        raise HTTPException(status_code=404, detail="Ürün bulunamadı")
    if not await product_repo.is_tracked_by_user(pid, current_user.id):
        raise HTTPException(status_code=403, detail="Bu ürün takip listenizde değil")

    return StreamingResponse(
        _agent_stream(product_id, current_user.id),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@router.get("/sessions")
async def list_sessions(
    page: int = Query(default=1, ge=1),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[dict]:
    repo = AnalysisHistoryRepository(db)
    sessions = await repo.list_by_user(current_user.id, page=page)
    return [
        {
            "id": str(s.id),
            "product_id": str(s.product_id),
            "product_name": s.product.name if s.product else None,
            "query": s.query,
            "created_at": s.created_at.isoformat(),
            "tokens_used": s.tokens_used,
            "result": s.result,
        }
        for s in sessions
    ]


@router.get("/sessions/{session_id}")
async def get_session(
    session_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    sid = _parse_uuid(session_id)
    repo = AnalysisHistoryRepository(db)
    session = await repo.get_by_id(sid)
    if session is None or session.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Session bulunamadı")
    return {
        "id": str(session.id),
        "product_id": str(session.product_id),
        "query": session.query,
        "created_at": session.created_at.isoformat(),
        "result": session.result,
    }


@router.delete("/sessions/{session_id}")
async def delete_session(
    session_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    sid = _parse_uuid(session_id)
    repo = AnalysisHistoryRepository(db)
    deleted = await repo.delete_by_id(sid, current_user.id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Session bulunamadı")
    return {"deleted": True}


async def _agent_stream(
    product_id: str, user_id: uuid.UUID
) -> AsyncGenerator[str, None]:
    from app.agents.graph import get_agent_graph
    from app.agents.state import AgentState

    def _sse(data: dict) -> str:
        return f"data: {json.dumps(data, ensure_ascii=False)}\n\n"

    redis = await get_redis()

    cached = await get_cached_agent_decision(redis, product_id)
    if cached:
        yield _sse({"type": "cached", "result": cached})
        yield _sse({"type": "done"})
        return

    initial_state: AgentState = {
        "product_id": product_id,
        "current_price": None,
        "predicted_price": None,
        "price_recommendation": None,
        "low_confidence": False,
        "data_points": 0,
        "review_chunks": [],
        "sentiment_score": None,
        "positive_pct": None,
        "negative_pct": None,
        "decision": None,
        "gpt_confidence": None,
        "rule_confidence": None,
        "final_confidence": None,
        "reasoning": None,
        "errors": [],
        "tokens_used": 0,
    }

    full_state: dict = dict(initial_state)

    try:
        graph = await get_agent_graph()
        yield _sse({"type": "node_start", "node": "price_analyst"})

        async for update in graph.astream(initial_state, stream_mode="updates"):
            for internal_name, patch in update.items():
                full_state.update(patch)
                display = _NODE_DISPLAY.get(internal_name, internal_name)
                yield _sse({"type": "node_done", "node": display})

                idx = _NODE_INDEX.get(internal_name)
                if idx is not None and idx + 1 < len(_NODE_ORDER):
                    next_display = _NODE_DISPLAY[_NODE_ORDER[idx + 1]]
                    yield _sse({"type": "node_start", "node": next_display})

    except Exception as exc:
        logger.error("Agent stream error for product %s: %s", product_id, exc)
        yield _sse({"type": "error", "message": "Agent çalıştırılırken hata oluştu."})

    final: dict = {
        "decision": full_state.get("decision") or "WAIT",
        "final_confidence": full_state.get("final_confidence") or 0,
        "reasoning": full_state.get("reasoning") or "Karar üretilemedi.",
        "current_price": full_state.get("current_price"),
        "predicted_price": full_state.get("predicted_price"),
        "price_recommendation": full_state.get("price_recommendation"),
        "sentiment_score": full_state.get("sentiment_score"),
        "errors": full_state.get("errors") or [],
    }

    yield _sse({"type": "final_decision", **final})

    try:
        await set_cached_agent_decision(redis, product_id, final)
    except Exception as exc:
        logger.warning("Failed to cache agent decision: %s", exc)

    try:
        async with AsyncSessionLocal() as session:
            repo = AnalysisHistoryRepository(session)
            await repo.create(
                user_id=user_id,
                product_id=uuid.UUID(product_id),
                query=f"decision:{product_id}",
                result=final,
                tokens_used=full_state.get("tokens_used"),
            )
            await session.commit()
    except Exception as exc:
        logger.warning("Failed to persist agent session: %s", exc)

    yield _sse({"type": "done"})

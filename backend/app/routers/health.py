import time

from fastapi import APIRouter, Depends
from redis.asyncio import Redis
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.redis import get_redis

router = APIRouter()


@router.get("/health")
async def health_check(
    db: AsyncSession = Depends(get_db),
    redis: Redis = Depends(get_redis),
) -> dict:
    checks: dict[str, str] = {}

    try:
        await db.execute(text("SELECT 1"))
        checks["db"] = "ok"
    except Exception as exc:
        checks["db"] = f"error: {exc}"

    try:
        t0 = time.monotonic()
        await redis.ping()
        checks["redis"] = f"ok ({int((time.monotonic() - t0) * 1000)}ms)"
    except Exception as exc:
        checks["redis"] = f"error: {exc}"

    status = "ok" if all(v.startswith("ok") for v in checks.values()) else "degraded"

    return {"status": status, "service": "pricewise-ai", "checks": checks}

from redis.asyncio import Redis, from_url

from app.core.config import settings

_redis: Redis | None = None


async def get_redis() -> Redis:
    global _redis
    if _redis is None:
        # rediss:// (TLS) is used by Redis Cloud / Upstash — disable cert verification
        # for self-signed certs on managed services.
        use_ssl = settings.REDIS_URL.startswith("rediss://")
        _redis = from_url(
            settings.REDIS_URL,
            encoding="utf-8",
            decode_responses=True,
            ssl_cert_reqs="none" if use_ssl else None,
        )
    return _redis


async def close_redis() -> None:
    global _redis
    if _redis is not None:
        await _redis.aclose()
        _redis = None

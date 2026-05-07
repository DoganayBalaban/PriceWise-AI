import hashlib
import json

from redis.asyncio import Redis


def _price_cache_key(product_id: str) -> str:
    return f"price:cache:{product_id}"


def _scrape_lock_key(url: str) -> str:
    url_hash = hashlib.md5(url.encode()).hexdigest()
    return f"scrape:lock:{url_hash}"


async def get_cached_price(redis: Redis, product_id: str) -> dict | None:
    raw = await redis.get(_price_cache_key(product_id))
    if raw is None:
        return None
    return json.loads(raw)


async def set_cached_price(redis: Redis, product_id: str, data: dict) -> None:
    await redis.set(_price_cache_key(product_id), json.dumps(data), ex=3600)


async def invalidate_price_cache(redis: Redis, product_id: str) -> None:
    await redis.delete(_price_cache_key(product_id))


async def invalidate_forecast_cache(redis: Redis, product_id: str) -> None:
    keys = [_forecast_cache_key(product_id, d) for d in (30, 90, 180)]
    await redis.delete(*keys)


async def acquire_scrape_lock(redis: Redis, url: str) -> bool:
    """Returns True if lock acquired, False if already locked."""
    key = _scrape_lock_key(url)
    result = await redis.set(key, "1", nx=True, ex=300)
    return result is not None


async def release_scrape_lock(redis: Redis, url: str) -> None:
    await redis.delete(_scrape_lock_key(url))


def _forecast_cache_key(product_id: str, days: int) -> str:
    return f"forecast:cache:{product_id}:{days}"


async def get_cached_forecast(redis: Redis, product_id: str, days: int) -> dict | None:
    raw = await redis.get(_forecast_cache_key(product_id, days))
    if raw is None:
        return None
    return json.loads(raw)


async def set_cached_forecast(
    redis: Redis, product_id: str, days: int, data: dict
) -> None:
    await redis.set(_forecast_cache_key(product_id, days), json.dumps(data), ex=21600)


def _sentiment_cache_key(product_id: str) -> str:
    return f"sentiment:cache:{product_id}"


async def get_cached_sentiment(redis: Redis, product_id: str) -> dict | None:
    raw = await redis.get(_sentiment_cache_key(product_id))
    if raw is None:
        return None
    return json.loads(raw)


async def set_cached_sentiment(redis: Redis, product_id: str, data: dict) -> None:
    await redis.set(_sentiment_cache_key(product_id), json.dumps(data), ex=86400)


def _summary_cache_key(product_id: str) -> str:
    return f"analysis:summary:{product_id}"


async def get_cached_summary(redis: Redis, product_id: str) -> dict | None:
    raw = await redis.get(_summary_cache_key(product_id))
    if raw is None:
        return None
    return json.loads(raw)


async def set_cached_summary(redis: Redis, product_id: str, data: dict) -> None:
    await redis.set(_summary_cache_key(product_id), json.dumps(data), ex=86400)


def _alert_sent_key(alert_id: str) -> str:
    return f"alert:sent:{alert_id}"


async def is_alert_sent(redis: Redis, alert_id: str) -> bool:
    return await redis.exists(_alert_sent_key(alert_id)) == 1


async def mark_alert_sent(redis: Redis, alert_id: str) -> None:
    await redis.set(_alert_sent_key(alert_id), "1", ex=86400)


def _agent_decision_cache_key(product_id: str) -> str:
    return f"agent:decision:{product_id}"


async def get_cached_agent_decision(redis: Redis, product_id: str) -> dict | None:
    raw = await redis.get(_agent_decision_cache_key(product_id))
    if raw is None:
        return None
    return json.loads(raw)


async def set_cached_agent_decision(redis: Redis, product_id: str, data: dict) -> None:
    await redis.set(
        _agent_decision_cache_key(product_id), json.dumps(data), ex=21600
    )  # 6h


async def invalidate_agent_decision_cache(redis: Redis, product_id: str) -> None:
    await redis.delete(_agent_decision_cache_key(product_id))


def _compare_cache_key(product_id: str) -> str:
    return f"compare:cache:{product_id}"


async def get_cached_comparison(redis: Redis, product_id: str) -> dict | None:
    raw = await redis.get(_compare_cache_key(product_id))
    if raw is None:
        return None
    return json.loads(raw)


async def set_cached_comparison(redis: Redis, product_id: str, data: dict) -> None:
    await redis.set(_compare_cache_key(product_id), json.dumps(data), ex=3600)

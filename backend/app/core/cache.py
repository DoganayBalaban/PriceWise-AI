import hashlib
import json
from typing import Any

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


async def acquire_scrape_lock(redis: Redis, url: str) -> bool:
    """Returns True if lock acquired, False if already locked."""
    key = _scrape_lock_key(url)
    result = await redis.set(key, "1", nx=True, ex=300)
    return result is not None


async def release_scrape_lock(redis: Redis, url: str) -> None:
    await redis.delete(_scrape_lock_key(url))

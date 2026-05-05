import asyncio
import logging
import re
import uuid
from collections import Counter
from typing import Any

from app.core.cache import get_cached_sentiment, set_cached_sentiment
from app.core.database import AsyncSessionLocal
from app.core.redis import get_redis
from app.repositories.review_repository import ReviewRepository

logger = logging.getLogger(__name__)

MODEL_ID = "saribasmetehan/bert-base-turkish-sentiment-analysis"
LABEL_MAP = {"LABEL_0": "neutral", "LABEL_1": "positive", "LABEL_2": "negative"}

TURKISH_STOPWORDS = {
    "bir", "bu", "da", "de", "ve", "ile", "için", "ama", "ya", "ki",
    "mi", "mu", "mü", "en", "çok", "daha", "ben", "biz", "sen", "siz",
    "o", "kadar", "ne", "gibi", "var", "yok", "her", "hiç", "bana",
    "beni", "bunu", "şu", "şunu", "ise", "hem", "veya", "iki", "üç",
    "dört", "beş", "çok", "çok", "iyi", "güzel", "aldım", "geldi",
    "ürün", "teşekkür", "ederim", "ettim", "oldu", "olarak", "olan",
    "ama", "lakin", "fakat", "ancak", "sadece", "bile", "bile", "artık",
    "hep", "zaten", "sanki", "nasıl", "neden", "nereden", "nerede",
    "tam", "tam", "çok", "gayet", "kesinlikle", "gerçekten",
}

# Module-level singleton
_pipeline: Any = None
_pipeline_lock = asyncio.Lock()


def _load_pipeline() -> Any:
    from transformers import pipeline as hf_pipeline
    logger.info("Loading Turkish sentiment model: %s", MODEL_ID)
    return hf_pipeline(
        "text-classification",
        model=MODEL_ID,
        device=-1,  # CPU
        truncation=True,
        max_length=512,
    )


async def _get_pipeline() -> Any:
    global _pipeline
    if _pipeline is not None:
        return _pipeline
    async with _pipeline_lock:
        if _pipeline is None:
            loop = asyncio.get_event_loop()
            _pipeline = await loop.run_in_executor(None, _load_pipeline)
    return _pipeline


async def _classify_texts(texts: list[str]) -> list[tuple[str, float]]:
    pipe = await _get_pipeline()
    loop = asyncio.get_event_loop()
    results = await loop.run_in_executor(None, pipe, texts)
    return [(LABEL_MAP.get(r["label"], "neutral"), float(r["score"])) for r in results]


def _extract_keywords(contents: list[str], top_n: int = 20) -> list[dict]:
    word_count: Counter = Counter()
    for content in contents:
        words = re.findall(r"\b[a-zçğıöşü]{3,}\b", content.lower())
        for word in words:
            if word not in TURKISH_STOPWORDS:
                word_count[word] += 1
    return [{"word": w, "count": c} for w, c in word_count.most_common(top_n)]


async def analyze_reviews_for_product(product_id: uuid.UUID) -> int:
    """Classify all unanalyzed reviews. Returns number of classified reviews."""
    async with AsyncSessionLocal() as session:
        repo = ReviewRepository(session)
        pending = await repo.list_without_sentiment(product_id)
        if not pending:
            return 0

        texts = [r.content[:512] for r in pending]
        try:
            classifications = await _classify_texts(texts)
        except Exception as exc:
            logger.error("Sentiment model error for %s: %s", product_id, exc)
            return 0

        for review, (label, score) in zip(pending, classifications):
            await repo.set_sentiment(review.id, label, score)

        await session.commit()
        logger.info("Classified %d reviews for product %s", len(pending), product_id)
        return len(pending)


async def compute_and_cache_sentiment(product_id: uuid.UUID, redis=None) -> dict:
    """Compute aggregate sentiment stats from DB and cache them."""
    async with AsyncSessionLocal() as session:
        repo = ReviewRepository(session)
        stats = await repo.get_sentiment_stats(product_id)
        trend = await repo.get_sentiment_trend(product_id, days=30)
        contents = await repo.get_review_contents(product_id)

    keywords = _extract_keywords(contents)
    result = {**stats, "trend": trend, "keywords": keywords}

    if redis is None:
        redis = await get_redis()

    try:
        await set_cached_sentiment(redis, str(product_id), result)
    except Exception as exc:
        logger.warning("Failed to cache sentiment for %s: %s", product_id, exc)

    return result


async def get_or_compute_sentiment(product_id: uuid.UUID, redis) -> dict:
    """Cache-first: return cached stats or compute fresh."""
    cached = await get_cached_sentiment(redis, str(product_id))
    if cached is not None:
        return cached

    # Check if we have any classified reviews
    async with AsyncSessionLocal() as session:
        repo = ReviewRepository(session)
        stats = await repo.get_sentiment_stats(product_id)

    if stats["total"] == 0:
        raise SentimentNotReadyError("insufficient_data")

    return await compute_and_cache_sentiment(product_id, redis)


async def refresh_all_sentiments() -> None:
    """Cron: re-analyze unclassified reviews and refresh cache for all products."""
    logger.info("Sentiment cron: starting")
    try:
        async with AsyncSessionLocal() as session:
            repo = ReviewRepository(session)
            product_ids = await repo.list_products_with_min_reviews(1)
    except Exception as exc:
        logger.error("Sentiment cron: failed to list products — %s", exc)
        return

    logger.info("Sentiment cron: %d products", len(product_ids))
    redis = await get_redis()

    for product_id in product_ids:
        try:
            await analyze_reviews_for_product(product_id)
            await compute_and_cache_sentiment(product_id, redis)
            logger.info("Sentiment cron: refreshed %s", product_id)
        except Exception as exc:
            logger.warning("Sentiment cron: failed for %s — %s", product_id, exc)
            continue

    logger.info("Sentiment cron: done")


class SentimentNotReadyError(Exception):
    pass

import json
import logging
import uuid
from datetime import datetime, timezone

from openai import AsyncOpenAI
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.cache import get_cached_summary, set_cached_summary
from app.core.config import settings
from app.core.database import AsyncSessionLocal
from app.core.redis import get_redis
from app.models.review import Review
from app.repositories.review_repository import ReviewRepository

logger = logging.getLogger(__name__)

MIN_REVIEWS = 10
MAX_REVIEWS = 30

_SYSTEM_PROMPT = (
    "Sen bir e-ticaret ürün analisti asistanısın. "
    "Verilen müşteri yorumlarını analiz ederek JSON formatında özet çıkarırsın. "
    "Yalnızca verilen yorumlara dayanarak karar ver, uydurma."
)


class ReviewSummaryError(Exception):
    pass


async def generate_summary(
    product_id: uuid.UUID,
    reviews: list[Review],
) -> dict:
    if not settings.OPENAI_API_KEY:
        raise ReviewSummaryError("OPENAI_API_KEY not configured")

    lines = []
    for i, r in enumerate(reviews, 1):
        rating_str = f"Puan:{r.rating}/5 — " if r.rating is not None else ""
        lines.append(f"[{i}] {rating_str}{r.content.strip()[:300]}")
    reviews_text = "\n".join(lines)

    user_message = (
        f"Aşağıda bu ürüne ait {len(reviews)} müşteri yorumu var:\n\n"
        f"{reviews_text}\n\n"
        "Bu yorumları analiz et ve şu JSON formatında yanıt ver:\n"
        "{\n"
        '  "pros": ["en fazla 4 olumlu madde, kısa ve Türkçe"],\n'
        '  "cons": ["en fazla 4 olumsuz madde, kısa ve Türkçe"],\n'
        '  "satisfaction_score": <0-100 arası tam sayı>,\n'
        '  "summary": "<tek cümle genel değerlendirme, Türkçe>"\n'
        "}"
    )

    client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
    try:
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": _SYSTEM_PROMPT},
                {"role": "user", "content": user_message},
            ],
            response_format={"type": "json_object"},
            temperature=0.2,
            max_tokens=600,
        )
    except Exception as exc:
        raise ReviewSummaryError(f"OpenAI API error: {exc}") from exc

    try:
        gpt_data = json.loads(response.choices[0].message.content or "{}")
    except json.JSONDecodeError as exc:
        raise ReviewSummaryError("GPT returned invalid JSON") from exc

    for key in ("pros", "cons", "satisfaction_score", "summary"):
        if key not in gpt_data:
            raise ReviewSummaryError(f"GPT response missing key: {key}")

    score = gpt_data["satisfaction_score"]
    if not isinstance(score, (int, float)) or not (0 <= score <= 100):
        raise ReviewSummaryError(f"satisfaction_score out of range: {score}")

    tokens_used = response.usage.total_tokens if response.usage else 0
    logger.info("Summary generated for %s — tokens: %d", product_id, tokens_used)

    return {
        "pros": gpt_data["pros"],
        "cons": gpt_data["cons"],
        "satisfaction_score": int(score),
        "summary": gpt_data["summary"],
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "review_count": len(reviews),
        "tokens_used": tokens_used,
    }


async def get_or_generate_summary(
    product_id: uuid.UUID,
    redis,
    db: AsyncSession,
) -> dict:
    cached = await get_cached_summary(redis, str(product_id))
    if cached is not None:
        return cached

    repo = ReviewRepository(db)
    count = await repo.count_by_product(product_id)
    if count < MIN_REVIEWS:
        raise ReviewSummaryError("insufficient_reviews")

    reviews = await repo.list_by_product(product_id)
    recent = reviews[:MAX_REVIEWS]

    result = await generate_summary(product_id, recent)

    try:
        await set_cached_summary(redis, str(product_id), result)
    except Exception as exc:
        logger.warning("Failed to cache summary for %s: %s", product_id, exc)

    return result


async def refresh_all_summaries() -> None:
    logger.info("Summary cron: starting refresh")
    try:
        async with AsyncSessionLocal() as session:
            repo = ReviewRepository(session)
            product_ids = await repo.list_products_with_min_reviews(MIN_REVIEWS)
    except Exception as exc:
        logger.error("Summary cron: failed to list products — %s", exc)
        return

    logger.info("Summary cron: %d products to refresh", len(product_ids))
    redis = await get_redis()

    for product_id in product_ids:
        try:
            async with AsyncSessionLocal() as session:
                repo = ReviewRepository(session)
                reviews = await repo.list_by_product(product_id)
                recent = reviews[:MAX_REVIEWS]
                result = await generate_summary(product_id, recent)
                await set_cached_summary(redis, str(product_id), result)
                logger.info("Summary cron: refreshed %s", product_id)
        except Exception as exc:
            logger.warning("Summary cron: failed for %s — %s", product_id, exc)
            continue

    logger.info("Summary cron: done")

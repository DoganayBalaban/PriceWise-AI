import logging
import uuid

from app.core.database import AsyncSessionLocal
from app.repositories.review_repository import ReviewRepository
from app.services.scraper import ScraperService

logger = logging.getLogger(__name__)


async def scrape_and_save_reviews(
    product_id: uuid.UUID,
    url: str,
    platform: str,
    max_reviews: int = 100,
) -> None:
    """Background task: scrape reviews, persist, then embed into Pinecone."""
    scraper = ScraperService()
    try:
        scraped = await scraper.scrape_reviews(url, platform, max_reviews)
    except Exception as exc:
        logger.warning("Review scraping failed for %s: %s", url, exc)
        return

    if not scraped:
        logger.info("No reviews found for %s", url)
        return

    async with AsyncSessionLocal() as session:
        try:
            repo = ReviewRepository(session)
            inserted = await repo.bulk_create(
                product_id=product_id,
                reviews=[
                    {
                        "content": r.content,
                        "rating": r.rating,
                        "review_date": r.review_date,
                        "verified": r.verified,
                    }
                    for r in scraped
                ],
            )
            await session.commit()
            logger.info("Saved %d new reviews for product %s", inserted, product_id)
        except Exception as exc:
            await session.rollback()
            logger.error("Failed to save reviews for %s: %s", product_id, exc)
            return

    # Embed newly saved reviews
    await embed_pending_reviews(product_id, platform)


async def embed_pending_reviews(product_id: uuid.UUID, platform: str) -> None:
    """Embed all reviews for a product that haven't been sent to Pinecone yet."""
    from app.services.embedding_service import embed_and_upsert_reviews

    async with AsyncSessionLocal() as session:
        try:
            repo = ReviewRepository(session)
            pending = await repo.list_without_embeddings(product_id)
            if not pending:
                return

            embedded_ids = await embed_and_upsert_reviews(pending, platform, product_id)

            for review in pending:
                review_id_str = str(review.id)
                if review_id_str in embedded_ids:
                    await repo.set_pinecone_id(review.id, f"{review_id_str}_0")

            await session.commit()
            logger.info(
                "Embedded %d reviews for product %s", len(embedded_ids), product_id
            )
        except Exception as exc:
            await session.rollback()
            logger.error("Embedding pipeline failed for %s: %s", product_id, exc)

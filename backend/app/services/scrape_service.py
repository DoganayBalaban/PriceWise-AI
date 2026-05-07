import logging

from app.core.cache import (
    acquire_scrape_lock,
    invalidate_forecast_cache,
    invalidate_price_cache,
    release_scrape_lock,
)
from app.core.database import AsyncSessionLocal
from app.core.redis import get_redis
from app.repositories.product_repository import ProductRepository
from app.services.scraper import ScraperService

logger = logging.getLogger(__name__)


async def scrape_all_products() -> None:
    logger.info("Daily scrape started")
    try:
        async with AsyncSessionLocal() as session:
            products = await ProductRepository(session).list_all()
    except Exception:
        logger.error("Daily scrape: failed to fetch product list", exc_info=True)
        return

    if not products:
        logger.info("Daily scrape: no products to scrape")
        return

    redis = await get_redis()
    scraper = ScraperService()
    ok = skipped = failed = 0

    for product in products:
        locked = await acquire_scrape_lock(redis, product.url)
        if not locked:
            logger.warning(
                "Daily scrape: %s is already being scraped, skipping", product.id
            )
            skipped += 1
            continue

        try:
            scraped = await scraper.scrape(product.url, product.platform)

            async with AsyncSessionLocal() as session:
                repo = ProductRepository(session)
                await repo.add_price_history(
                    product_id=product.id,
                    price=scraped.current_price,
                    original_price=scraped.original_price,
                    discount_pct=scraped.discount_pct,
                    in_stock=scraped.in_stock,
                )
                await session.commit()

            pid = str(product.id)
            await invalidate_price_cache(redis, pid)
            await invalidate_forecast_cache(redis, pid)
            ok += 1
            logger.debug(
                "Daily scrape: scraped %s → ₺%s", product.id, scraped.current_price
            )
        except Exception:
            logger.error(
                "Daily scrape: failed for product %s", product.id, exc_info=True
            )
            failed += 1
        finally:
            await release_scrape_lock(redis, product.url)

    logger.info(
        "Daily scrape complete — ok=%d skipped=%d failed=%d total=%d",
        ok,
        skipped,
        failed,
        len(products),
    )

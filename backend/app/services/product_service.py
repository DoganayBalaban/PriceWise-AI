from redis.asyncio import Redis

from app.core.cache import acquire_scrape_lock, release_scrape_lock
from app.core.utils import detect_platform, normalize_url
from app.models.price_history import PriceHistory
from app.models.product import Product
from app.repositories.product_repository import ProductRepository
from app.services.scraper import ScraperService


class ProductService:
    def __init__(
        self,
        repo: ProductRepository,
        scraper: ScraperService,
        redis: Redis,
    ) -> None:
        self.repo = repo
        self.scraper = scraper
        self.redis = redis

    async def get_or_create_product(
        self, raw_url: str
    ) -> tuple[Product, PriceHistory]:
        url = normalize_url(raw_url)
        platform = detect_platform(url)

        existing = await self.repo.get_by_url(url)
        if existing:
            latest = await self.repo.get_latest_price(existing.id)
            if latest is None:
                await self._scrape_and_record(existing.id, url, platform)
                latest = await self.repo.get_latest_price(existing.id)
            return existing, latest

        locked = await acquire_scrape_lock(self.redis, url)
        if not locked:
            raise RuntimeError("Bu URL için scraping zaten devam ediyor, lütfen bekleyin")

        try:
            scraped = await self.scraper.scrape(url, platform)
            product = await self.repo.create(
                url=url,
                platform=platform,
                name=scraped.name,
                brand=scraped.brand,
                category=scraped.category,
                image_url=scraped.image_url,
            )
            price = await self.repo.add_price_history(
                product_id=product.id,
                price=scraped.current_price,
                original_price=scraped.original_price,
                discount_pct=scraped.discount_pct,
                in_stock=scraped.in_stock,
            )
        finally:
            await release_scrape_lock(self.redis, url)

        return product, price

    async def _scrape_and_record(
        self, product_id, url: str, platform: str
    ) -> PriceHistory:
        scraped = await self.scraper.scrape(url, platform)
        return await self.repo.add_price_history(
            product_id=product_id,
            price=scraped.current_price,
            original_price=scraped.original_price,
            discount_pct=scraped.discount_pct,
            in_stock=scraped.in_stock,
        )

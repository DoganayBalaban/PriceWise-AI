from app.core.utils import detect_platform, normalize_url
from app.models.price_history import PriceHistory
from app.models.product import Product
from app.repositories.product_repository import ProductRepository
from app.services.scraper import ScraperService


class ProductService:
    def __init__(self, repo: ProductRepository, scraper: ScraperService) -> None:
        self.repo = repo
        self.scraper = scraper

    async def get_or_create_product(
        self, raw_url: str
    ) -> tuple[Product, PriceHistory]:
        url = normalize_url(raw_url)
        platform = detect_platform(url)  # raises ValueError for unsupported hosts

        existing = await self.repo.get_by_url(url)
        if existing:
            latest = await self.repo.get_latest_price(existing.id)
            if latest is None:
                # product exists but has no price history — scrape and add
                scraped = await self.scraper.scrape(url, platform)
                latest = await self.repo.add_price_history(
                    product_id=existing.id,
                    price=scraped.current_price,
                    original_price=scraped.original_price,
                    discount_pct=scraped.discount_pct,
                    in_stock=scraped.in_stock,
                )
            return existing, latest

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
        return product, price

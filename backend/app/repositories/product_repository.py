import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.price_history import PriceHistory
from app.models.product import Product


class ProductRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_by_url(self, url: str) -> Product | None:
        result = await self.session.execute(
            select(Product).where(Product.url == url)
        )
        return result.scalar_one_or_none()

    async def get_by_id(self, product_id: uuid.UUID) -> Product | None:
        result = await self.session.execute(
            select(Product).where(Product.id == product_id)
        )
        return result.scalar_one_or_none()

    async def create(
        self,
        url: str,
        platform: str,
        name: str,
        brand: str | None,
        category: str | None,
        image_url: str | None,
    ) -> Product:
        product = Product(
            url=url,
            platform=platform,
            name=name,
            brand=brand,
            category=category,
            image_url=image_url,
        )
        self.session.add(product)
        await self.session.flush()
        return product

    async def add_price_history(
        self,
        product_id: uuid.UUID,
        price: float,
        original_price: float | None,
        discount_pct: float | None,
        in_stock: bool,
    ) -> PriceHistory:
        entry = PriceHistory(
            product_id=product_id,
            price=price,
            original_price=original_price,
            discount_pct=discount_pct,
            in_stock=in_stock,
        )
        self.session.add(entry)
        await self.session.flush()
        return entry

    async def get_latest_price(self, product_id: uuid.UUID) -> PriceHistory | None:
        result = await self.session.execute(
            select(PriceHistory)
            .where(PriceHistory.product_id == product_id)
            .order_by(PriceHistory.scraped_at.desc())
            .limit(1)
        )
        return result.scalar_one_or_none()

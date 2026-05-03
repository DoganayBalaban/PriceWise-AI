import uuid
from datetime import datetime, timedelta

from sqlalchemy import delete, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.price_history import PriceHistory
from app.models.product import Product
from app.models.user_product import UserProduct


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

    async def list_by_user(self, user_id: uuid.UUID) -> list[Product]:
        result = await self.session.execute(
            select(Product)
            .join(UserProduct, UserProduct.product_id == Product.id)
            .where(UserProduct.user_id == user_id)
            .order_by(UserProduct.added_at.desc())
        )
        return list(result.scalars().all())

    async def is_tracked_by_user(self, product_id: uuid.UUID, user_id: uuid.UUID) -> bool:
        result = await self.session.execute(
            select(UserProduct).where(
                UserProduct.product_id == product_id,
                UserProduct.user_id == user_id,
            )
        )
        return result.scalar_one_or_none() is not None

    async def link_to_user(self, product_id: uuid.UUID, user_id: uuid.UUID) -> None:
        already = await self.is_tracked_by_user(product_id, user_id)
        if not already:
            self.session.add(UserProduct(user_id=user_id, product_id=product_id))
            await self.session.flush()

    async def unlink_from_user(self, product_id: uuid.UUID, user_id: uuid.UUID) -> bool:
        result = await self.session.execute(
            delete(UserProduct).where(
                UserProduct.product_id == product_id,
                UserProduct.user_id == user_id,
            )
        )
        await self.session.flush()
        return result.rowcount > 0

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

    async def get_price_history(
        self, product_id: uuid.UUID, days: int
    ) -> list[PriceHistory]:
        since = datetime.utcnow() - timedelta(days=days)
        result = await self.session.execute(
            select(PriceHistory)
            .where(
                PriceHistory.product_id == product_id,
                PriceHistory.scraped_at >= since,
            )
            .order_by(PriceHistory.scraped_at.asc())
        )
        return list(result.scalars().all())

    async def get_price_stats(self, product_id: uuid.UUID, days: int) -> dict:
        since = datetime.utcnow() - timedelta(days=days)
        row = await self.session.execute(
            select(
                func.min(PriceHistory.price).label("min_price"),
                func.max(PriceHistory.price).label("max_price"),
                func.avg(PriceHistory.price).label("avg_price"),
                func.stddev_pop(PriceHistory.price).label("stddev_price"),
                func.count(PriceHistory.id).label("data_points"),
            ).where(
                PriceHistory.product_id == product_id,
                PriceHistory.scraped_at >= since,
            )
        )
        return row.mappings().one()

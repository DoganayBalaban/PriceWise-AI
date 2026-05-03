import uuid
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.alert import Alert


class AlertRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def create(
        self,
        product_id: uuid.UUID,
        email: str,
        target_price: Decimal,
        user_id: uuid.UUID | None = None,
    ) -> Alert:
        alert = Alert(product_id=product_id, email=email, target_price=target_price, user_id=user_id)
        self.session.add(alert)
        await self.session.flush()
        return alert

    async def get_by_id(self, alert_id: uuid.UUID) -> Alert | None:
        result = await self.session.execute(
            select(Alert).where(Alert.id == alert_id)
        )
        return result.scalar_one_or_none()

    async def get_by_product_email(
        self, product_id: uuid.UUID, email: str
    ) -> Alert | None:
        result = await self.session.execute(
            select(Alert).where(
                Alert.product_id == product_id,
                Alert.email == email,
            )
        )
        return result.scalar_one_or_none()

    async def list_by_email(self, email: str) -> list[Alert]:
        result = await self.session.execute(
            select(Alert)
            .where(Alert.email == email)
            .order_by(Alert.created_at.desc())
        )
        return list(result.scalars().all())

    async def list_active(self) -> list[Alert]:
        result = await self.session.execute(
            select(Alert).where(Alert.active == True)  # noqa: E712
        )
        return list(result.scalars().all())

    async def update(
        self,
        alert_id: uuid.UUID,
        target_price: Decimal | None = None,
        active: bool | None = None,
    ) -> Alert | None:
        alert = await self.get_by_id(alert_id)
        if alert is None:
            return None
        if target_price is not None:
            alert.target_price = target_price
        if active is not None:
            alert.active = active
        await self.session.flush()
        return alert

    async def delete(self, alert_id: uuid.UUID) -> bool:
        alert = await self.get_by_id(alert_id)
        if alert is None:
            return False
        await self.session.delete(alert)
        await self.session.flush()
        return True

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User


class UserRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_by_email(self, email: str) -> User | None:
        result = await self.session.execute(
            select(User).where(User.email == email)
        )
        return result.scalar_one_or_none()

    async def get_by_id(self, user_id: uuid.UUID) -> User | None:
        result = await self.session.execute(
            select(User).where(User.id == user_id)
        )
        return result.scalar_one_or_none()

    async def get_or_create(self, email: str, name: str | None = None) -> User:
        user = await self.get_by_email(email)
        if user:
            return user
        user = User(email=email, name=name)
        self.session.add(user)
        await self.session.flush()
        return user

    async def get_by_lemon_customer_id(self, customer_id: str) -> User | None:
        result = await self.session.execute(
            select(User).where(User.lemon_customer_id == customer_id)
        )
        return result.scalar_one_or_none()

    async def update_plan(
        self,
        user: User,
        plan: str,
        queries_limit: int,
        lemon_customer_id: str | None = None,
        lemon_subscription_id: str | None = None,
        reset_queries_used: bool = False,
    ) -> User:
        user.plan = plan
        user.queries_limit = queries_limit
        if reset_queries_used:
            user.queries_used = 0
        if lemon_customer_id is not None:
            user.lemon_customer_id = lemon_customer_id
        if lemon_subscription_id is not None:
            user.lemon_subscription_id = lemon_subscription_id
        await self.session.flush()
        return user

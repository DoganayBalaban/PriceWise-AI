import uuid

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.models.analysis_history import AnalysisHistory


class AnalysisHistoryRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def create(
        self,
        user_id: uuid.UUID,
        product_id: uuid.UUID,
        query: str,
        result: dict,
        tokens_used: int | None = None,
    ) -> AnalysisHistory:
        entry = AnalysisHistory(
            user_id=user_id,
            product_id=product_id,
            query=query,
            result=result,
            tokens_used=tokens_used,
        )
        self.session.add(entry)
        await self.session.flush()
        return entry

    async def get_by_id(self, session_id: uuid.UUID) -> AnalysisHistory | None:
        result = await self.session.execute(
            select(AnalysisHistory).where(AnalysisHistory.id == session_id)
        )
        return result.scalar_one_or_none()

    async def list_by_user(
        self, user_id: uuid.UUID, page: int = 1, page_size: int = 20
    ) -> list[AnalysisHistory]:
        offset = (page - 1) * page_size
        result = await self.session.execute(
            select(AnalysisHistory)
            .options(joinedload(AnalysisHistory.product))
            .where(AnalysisHistory.user_id == user_id)
            .order_by(AnalysisHistory.created_at.desc())
            .offset(offset)
            .limit(page_size)
        )
        return list(result.scalars().all())

    async def delete_by_id(self, session_id: uuid.UUID, user_id: uuid.UUID) -> bool:
        result = await self.session.execute(
            delete(AnalysisHistory).where(
                AnalysisHistory.id == session_id,
                AnalysisHistory.user_id == user_id,
            )
        )
        await self.session.flush()
        return result.rowcount > 0

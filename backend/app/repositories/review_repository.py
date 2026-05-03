import uuid
from datetime import date

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.review import Review


class ReviewRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def count_by_product(self, product_id: uuid.UUID) -> int:
        result = await self.session.execute(
            select(Review).where(Review.product_id == product_id)
        )
        return len(result.scalars().all())

    async def list_by_product(self, product_id: uuid.UUID) -> list[Review]:
        result = await self.session.execute(
            select(Review)
            .where(Review.product_id == product_id)
            .order_by(Review.review_date.desc().nullslast(), Review.created_at.desc())
        )
        return list(result.scalars().all())

    async def list_without_embeddings(self, product_id: uuid.UUID) -> list[Review]:
        result = await self.session.execute(
            select(Review).where(
                Review.product_id == product_id,
                Review.pinecone_id.is_(None),
            )
        )
        return list(result.scalars().all())

    async def bulk_create(
        self,
        product_id: uuid.UUID,
        reviews: list[dict],
    ) -> int:
        """Insert reviews, skip duplicates by content. Returns number inserted."""
        existing_result = await self.session.execute(
            select(Review.content).where(Review.product_id == product_id)
        )
        existing_contents = {row for row in existing_result.scalars().all()}

        inserted = 0
        for r in reviews:
            content = r.get("content", "").strip()
            if not content or content in existing_contents:
                continue
            self.session.add(Review(
                product_id=product_id,
                content=content,
                rating=r.get("rating"),
                review_date=r.get("review_date"),
                verified=r.get("verified", False),
            ))
            existing_contents.add(content)
            inserted += 1

        if inserted:
            await self.session.flush()
        return inserted

    async def set_pinecone_id(self, review_id: uuid.UUID, pinecone_id: str) -> None:
        result = await self.session.execute(
            select(Review).where(Review.id == review_id)
        )
        review = result.scalar_one_or_none()
        if review:
            review.pinecone_id = pinecone_id
            await self.session.flush()

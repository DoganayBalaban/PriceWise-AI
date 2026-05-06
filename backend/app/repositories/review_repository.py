import uuid
from datetime import date, timedelta

from sqlalchemy import func, select, update
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

    async def list_products_with_min_reviews(self, min_count: int) -> list[uuid.UUID]:
        result = await self.session.execute(
            select(Review.product_id)
            .group_by(Review.product_id)
            .having(func.count(Review.id) >= min_count)
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
            self.session.add(
                Review(
                    product_id=product_id,
                    content=content,
                    rating=r.get("rating"),
                    review_date=r.get("review_date"),
                    verified=r.get("verified", False),
                )
            )
            existing_contents.add(content)
            inserted += 1

        if inserted:
            await self.session.flush()
        return inserted

    async def list_without_sentiment(self, product_id: uuid.UUID) -> list[Review]:
        result = await self.session.execute(
            select(Review).where(
                Review.product_id == product_id,
                Review.sentiment_label.is_(None),
            )
        )
        return list(result.scalars().all())

    async def set_sentiment(
        self, review_id: uuid.UUID, label: str, score: float
    ) -> None:
        await self.session.execute(
            update(Review)
            .where(Review.id == review_id)
            .values(sentiment_label=label, sentiment_score=score)
        )

    async def get_sentiment_stats(self, product_id: uuid.UUID) -> dict:
        result = await self.session.execute(
            select(Review.sentiment_label, func.count(Review.id).label("cnt"))
            .where(
                Review.product_id == product_id,
                Review.sentiment_label.isnot(None),
            )
            .group_by(Review.sentiment_label)
        )
        counts: dict[str, int] = {label: cnt for label, cnt in result.fetchall()}
        total = sum(counts.values())
        if total == 0:
            return {
                "score": 0,
                "total": 0,
                "positive_pct": 0,
                "negative_pct": 0,
                "neutral_pct": 0,
            }
        pos = counts.get("positive", 0)
        neg = counts.get("negative", 0)
        neu = counts.get("neutral", 0)
        return {
            "score": round((pos * 100 + neu * 50) / total),
            "total": total,
            "positive_pct": round(pos / total * 100),
            "negative_pct": round(neg / total * 100),
            "neutral_pct": round(neu / total * 100),
        }

    async def get_sentiment_trend(
        self, product_id: uuid.UUID, days: int = 30
    ) -> list[dict]:
        cutoff = date.today() - timedelta(days=days)
        result = await self.session.execute(
            select(
                Review.review_date,
                Review.sentiment_label,
                func.count(Review.id).label("cnt"),
            )
            .where(
                Review.product_id == product_id,
                Review.sentiment_label.isnot(None),
                Review.review_date >= cutoff,
            )
            .group_by(Review.review_date, Review.sentiment_label)
            .order_by(Review.review_date)
        )
        by_date: dict[date, dict[str, int]] = {}
        for review_date, label, cnt in result.fetchall():
            if review_date not in by_date:
                by_date[review_date] = {}
            by_date[review_date][label] = cnt

        trend = []
        for d, cnts in sorted(by_date.items()):
            total = sum(cnts.values())
            pos = cnts.get("positive", 0)
            neu = cnts.get("neutral", 0)
            score = round((pos * 100 + neu * 50) / total) if total > 0 else 0
            trend.append({"date": d.isoformat(), "score": score, "total": total})
        return trend

    async def get_review_contents(self, product_id: uuid.UUID) -> list[str]:
        result = await self.session.execute(
            select(Review.content).where(Review.product_id == product_id)
        )
        return list(result.scalars().all())

    async def set_pinecone_id(self, review_id: uuid.UUID, pinecone_id: str) -> None:
        result = await self.session.execute(
            select(Review).where(Review.id == review_id)
        )
        review = result.scalar_one_or_none()
        if review:
            review.pinecone_id = pinecone_id
            await self.session.flush()

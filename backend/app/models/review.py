import uuid
from datetime import date, datetime

from sqlalchemy import Boolean, CheckConstraint, Date, ForeignKey, Numeric, SmallInteger, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, UUIDMixin


class Review(UUIDMixin, Base):
    __tablename__ = "reviews"

    product_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("products.id", ondelete="CASCADE"), nullable=False
    )
    rating: Mapped[int | None] = mapped_column(
        SmallInteger,
        CheckConstraint("rating BETWEEN 1 AND 5", name="ck_reviews_rating"),
    )
    content: Mapped[str] = mapped_column(Text, nullable=False)
    sentiment_label: Mapped[str | None] = mapped_column(Text)  # positive | negative | neutral
    sentiment_score: Mapped[float | None] = mapped_column(Numeric(4, 3))
    pinecone_id: Mapped[str | None] = mapped_column(Text)
    verified: Mapped[bool] = mapped_column(Boolean, default=False)
    review_date: Mapped[date | None] = mapped_column(Date)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())

    product: Mapped["Product"] = relationship("Product", back_populates="reviews")


from app.models.product import Product  # noqa: E402, F401

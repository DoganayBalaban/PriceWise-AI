import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import Boolean, ForeignKey, Index, Numeric, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, UUIDMixin


class PriceHistory(UUIDMixin, Base):
    __tablename__ = "price_history"
    __table_args__ = (
        Index("idx_price_history_product_scraped", "product_id", "scraped_at"),
    )

    product_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("products.id", ondelete="CASCADE"), nullable=False
    )
    price: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    original_price: Mapped[Decimal | None] = mapped_column(Numeric(10, 2))
    discount_pct: Mapped[Decimal | None] = mapped_column(Numeric(5, 2))
    in_stock: Mapped[bool] = mapped_column(Boolean, default=True)
    seller_name: Mapped[str | None] = mapped_column(Text)
    scraped_at: Mapped[datetime] = mapped_column(server_default=func.now())

    product: Mapped["Product"] = relationship("Product", back_populates="price_history")


from app.models.product import Product  # noqa: E402, F401 — resolves forward ref

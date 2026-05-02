import uuid
from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, ForeignKey, Index, Numeric, Text, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, UUIDMixin

if TYPE_CHECKING:
    from app.models.product import Product
    from app.models.user import User


class Alert(UUIDMixin, Base):
    __tablename__ = "alerts"

    user_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    product_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("products.id", ondelete="CASCADE"), nullable=False
    )
    email: Mapped[str] = mapped_column(Text, nullable=False)
    target_price: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())

    __table_args__ = (
        UniqueConstraint("product_id", "email", name="uq_alert_product_email"),
        Index("idx_alerts_active", "active"),
    )

    product: Mapped["Product"] = relationship("Product", back_populates="alerts")
    user: Mapped["User | None"] = relationship("User", back_populates="alerts")


from app.models.product import Product  # noqa: E402, F401
from app.models.user import User  # noqa: E402, F401

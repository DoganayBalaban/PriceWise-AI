import uuid
from datetime import datetime

from sqlalchemy import Boolean, Integer, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, UUIDMixin


class User(UUIDMixin, Base):
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(Text, nullable=False, unique=True)
    hashed_password: Mapped[str | None] = mapped_column(Text, nullable=True)
    name: Mapped[str | None] = mapped_column(Text, nullable=True)
    email_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    plan: Mapped[str] = mapped_column(Text, default="free")  # free | pro
    queries_used: Mapped[int] = mapped_column(Integer, default=0)
    queries_limit: Mapped[int] = mapped_column(Integer, default=5)
    lemon_customer_id: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())

    analysis_history: Mapped[list["AnalysisHistory"]] = relationship(
        "AnalysisHistory", back_populates="user"
    )

    alerts: Mapped[list["Alert"]] = relationship(
        "Alert", back_populates="user", cascade="all, delete-orphan"
    )

    tracked_products: Mapped[list["UserProduct"]] = relationship(
        "UserProduct", back_populates="user", cascade="all, delete-orphan"
    )


from app.models.analysis_history import AnalysisHistory  # noqa: E402, F401
from app.models.alert import Alert  # noqa: E402, F401
from app.models.user_product import UserProduct  # noqa: E402, F401

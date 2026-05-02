import uuid
from datetime import datetime

from sqlalchemy import Integer, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, UUIDMixin


class User(UUIDMixin, Base):
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(Text, nullable=False, unique=True)
    hashed_password: Mapped[str] = mapped_column(Text, nullable=False)
    plan: Mapped[str] = mapped_column(Text, default="free")  # free | pro
    queries_used: Mapped[int] = mapped_column(Integer, default=0)
    queries_limit: Mapped[int] = mapped_column(Integer, default=5)
    lemon_customer_id: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())

    analysis_history: Mapped[list["AnalysisHistory"]] = relationship(
        "AnalysisHistory", back_populates="user"
    )


from app.models.analysis_history import AnalysisHistory  # noqa: E402, F401

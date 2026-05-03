import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel


class AlertCreateRequest(BaseModel):
    product_id: uuid.UUID
    target_price: Decimal


class AlertUpdateRequest(BaseModel):
    target_price: Decimal | None = None
    active: bool | None = None


class AlertResponse(BaseModel):
    id: uuid.UUID
    product_id: uuid.UUID
    email: str
    target_price: float
    active: bool
    created_at: datetime

    model_config = {"from_attributes": True}

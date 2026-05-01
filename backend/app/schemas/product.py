import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, HttpUrl


class ProductSubmitRequest(BaseModel):
    url: HttpUrl


class PriceDataResponse(BaseModel):
    price: float
    original_price: float | None
    discount_pct: float | None
    in_stock: bool
    scraped_at: datetime


class ProductResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    url: str
    platform: str
    name: str
    brand: str | None
    category: str | None
    image_url: str | None
    created_at: datetime
    latest_price: PriceDataResponse

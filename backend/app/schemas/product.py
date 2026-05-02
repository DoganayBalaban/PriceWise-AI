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


class ProductListResponse(BaseModel):
    products: list[ProductResponse]
    total: int


class PriceHistoryEntry(BaseModel):
    price: float
    original_price: float | None
    discount_pct: float | None
    in_stock: bool
    scraped_at: datetime


class PriceStatsResponse(BaseModel):
    product_id: uuid.UUID
    days: int
    min_price: float | None
    max_price: float | None
    avg_price: float | None
    stddev_price: float | None
    data_points: int

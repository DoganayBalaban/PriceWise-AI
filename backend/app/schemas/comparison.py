import uuid
from datetime import datetime

from pydantic import BaseModel


class PlatformPrice(BaseModel):
    platform: str
    url: str
    name: str
    current_price: float
    original_price: float | None
    discount_pct: float | None
    in_stock: bool
    image_url: str | None
    avg_rating: float | None
    is_source: bool


class ComparisonResult(BaseModel):
    product_id: uuid.UUID
    compared_at: datetime
    results: list[PlatformPrice]
    cheapest_platform: str
    price_diff: float
    price_diff_pct: float

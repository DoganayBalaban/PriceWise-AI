import uuid
from datetime import datetime

from pydantic import BaseModel


class ForecastPoint(BaseModel):
    date: datetime
    predicted_price: float


class ForecastResponse(BaseModel):
    product_id: uuid.UUID
    forecast_days: int
    forecast: list[ForecastPoint]
    current_price: float
    predicted_final_price: float
    mae: float
    low_confidence: bool
    recommendation: str
    data_points: int

from pydantic import BaseModel, HttpUrl


class PriceTrackRequest(BaseModel):
    url: HttpUrl
    target_price: float | None = None


class PriceTrackResponse(BaseModel):
    url: str
    product_name: str
    current_price: float
    currency: str
    tracked: bool

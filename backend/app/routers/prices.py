from fastapi import APIRouter
from app.schemas.price import PriceTrackRequest, PriceTrackResponse

router = APIRouter()


@router.get("/")
async def list_prices():
    return {"prices": [], "message": "Price tracking coming soon"}


@router.post("/track")
async def track_price(payload: PriceTrackRequest) -> PriceTrackResponse:
    return PriceTrackResponse(
        url=payload.url,
        product_name="Sample Product",
        current_price=0.0,
        currency="USD",
        tracked=True,
    )

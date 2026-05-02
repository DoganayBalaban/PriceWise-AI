import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.repositories.product_repository import ProductRepository
from app.schemas.product import PriceHistoryEntry, PriceStatsResponse

router = APIRouter()


def _parse_uuid(product_id: str) -> uuid.UUID:
    try:
        return uuid.UUID(product_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid product ID")


@router.get("/{product_id}/history", response_model=list[PriceHistoryEntry])
async def get_price_history(
    product_id: str,
    days: int = Query(default=30, ge=1, le=365),
    db: AsyncSession = Depends(get_db),
) -> list[PriceHistoryEntry]:
    pid = _parse_uuid(product_id)
    repo = ProductRepository(db)
    product = await repo.get_by_id(pid)
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    history = await repo.get_price_history(pid, days)
    return [
        PriceHistoryEntry(
            price=float(h.price),
            original_price=float(h.original_price) if h.original_price else None,
            discount_pct=float(h.discount_pct) if h.discount_pct else None,
            in_stock=h.in_stock,
            scraped_at=h.scraped_at,
        )
        for h in history
    ]


@router.get("/{product_id}/stats", response_model=PriceStatsResponse)
async def get_price_stats(
    product_id: str,
    days: int = Query(default=30, ge=1, le=365),
    db: AsyncSession = Depends(get_db),
) -> PriceStatsResponse:
    pid = _parse_uuid(product_id)
    repo = ProductRepository(db)
    product = await repo.get_by_id(pid)
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    stats = await repo.get_price_stats(pid, days)
    return PriceStatsResponse(
        product_id=pid,
        days=days,
        min_price=float(stats["min_price"]) if stats["min_price"] is not None else None,
        max_price=float(stats["max_price"]) if stats["max_price"] is not None else None,
        avg_price=float(stats["avg_price"]) if stats["avg_price"] is not None else None,
        stddev_price=float(stats["stddev_price"]) if stats["stddev_price"] is not None else None,
        data_points=int(stats["data_points"]),
    )


@router.get("/{product_id}/forecast")
async def get_price_forecast(product_id: str) -> dict:
    return {
        "message": "Price forecast coming soon (requires ML pipeline)",
        "product_id": product_id,
        "forecast": [],
    }


@router.get("/{product_id}/compare")
async def compare_prices(product_id: str) -> dict:
    return {
        "message": "Price comparison coming soon",
        "product_id": product_id,
        "comparisons": [],
    }


@router.get("/{product_id}/decision")
async def get_buy_decision(product_id: str) -> dict:
    return {
        "message": "Buy/wait decision coming soon (requires AI integration)",
        "product_id": product_id,
        "recommendation": None,
    }

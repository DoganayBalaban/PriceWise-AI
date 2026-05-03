import uuid
import logging

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger(__name__)

from app.core.cache import (
    get_cached_price,
    invalidate_price_cache,
    set_cached_price,
)
from app.core.database import get_db
from app.core.redis import get_redis
from app.core.security import get_current_user
from app.models.user import User
from app.repositories.product_repository import ProductRepository
from app.schemas.product import (
    PriceDataResponse,
    ProductListResponse,
    ProductResponse,
    ProductSubmitRequest,
)
from app.services.product_service import ProductService, ScrapeConflictError
from app.services.scraper import ScraperService
from app.services.review_service import scrape_and_save_reviews

router = APIRouter()


def _build_response(product, price) -> ProductResponse:
    return ProductResponse(
        id=product.id,
        url=product.url,
        platform=product.platform,
        name=product.name,
        brand=product.brand,
        category=product.category,
        image_url=product.image_url,
        created_at=product.created_at,
        latest_price=PriceDataResponse(
            price=float(price.price),
            original_price=float(price.original_price) if price.original_price else None,
            discount_pct=float(price.discount_pct) if price.discount_pct else None,
            in_stock=price.in_stock,
            scraped_at=price.scraped_at,
        ),
    )


def _price_dict(price) -> dict:
    return {
        "price": float(price.price),
        "original_price": float(price.original_price) if price.original_price else None,
        "discount_pct": float(price.discount_pct) if price.discount_pct else None,
        "in_stock": price.in_stock,
        "scraped_at": price.scraped_at.isoformat(),
    }


def _parse_uuid(product_id: str) -> uuid.UUID:
    try:
        return uuid.UUID(product_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid product ID")


@router.post("/", response_model=ProductResponse, status_code=201)
async def submit_product(
    body: ProductSubmitRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    redis: Redis = Depends(get_redis),
    current_user: User = Depends(get_current_user),
) -> ProductResponse:
    repo = ProductRepository(db)
    service = ProductService(repo, ScraperService(), redis)
    try:
        product, price = await service.get_or_create_product(str(body.url), current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except ScrapeConflictError as e:
        raise HTTPException(status_code=409, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Scraping failed: {e}")

    await set_cached_price(redis, str(product.id), _price_dict(price))

    # Scrape reviews in background — don't block the response
    background_tasks.add_task(
        scrape_and_save_reviews,
        product_id=product.id,
        url=product.url,
        platform=product.platform,
    )

    return _build_response(product, price)


@router.get("/", response_model=ProductListResponse)
async def list_products(
    db: AsyncSession = Depends(get_db),
    redis: Redis = Depends(get_redis),
    current_user: User = Depends(get_current_user),
) -> ProductListResponse:
    repo = ProductRepository(db)
    products = await repo.list_by_user(current_user.id)
    items = []
    for product in products:
        cached = await get_cached_price(redis, str(product.id))
        if cached:
            price_data = PriceDataResponse(**cached)
        else:
            price = await repo.get_latest_price(product.id)
            if price is None:
                continue
            price_data = PriceDataResponse(**_price_dict(price))
            await set_cached_price(redis, str(product.id), _price_dict(price))
        items.append(ProductResponse(
            id=product.id,
            url=product.url,
            platform=product.platform,
            name=product.name,
            brand=product.brand,
            category=product.category,
            image_url=product.image_url,
            created_at=product.created_at,
            latest_price=price_data,
        ))
    return ProductListResponse(products=items, total=len(items))


@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(
    product_id: str,
    db: AsyncSession = Depends(get_db),
    redis: Redis = Depends(get_redis),
    current_user: User = Depends(get_current_user),
) -> ProductResponse:
    pid = _parse_uuid(product_id)
    repo = ProductRepository(db)
    product = await repo.get_by_id(pid)
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")

    if not await repo.is_tracked_by_user(pid, current_user.id):
        raise HTTPException(status_code=403, detail="Bu ürün takip listenizde değil")

    cached = await get_cached_price(redis, product_id)
    if cached:
        return ProductResponse(
            id=product.id,
            url=product.url,
            platform=product.platform,
            name=product.name,
            brand=product.brand,
            category=product.category,
            image_url=product.image_url,
            created_at=product.created_at,
            latest_price=PriceDataResponse(**cached),
        )

    price = await repo.get_latest_price(pid)
    if price is None:
        raise HTTPException(status_code=404, detail="No price data for product")

    await set_cached_price(redis, product_id, _price_dict(price))
    return _build_response(product, price)


@router.delete("/{product_id}", status_code=204)
async def delete_product(
    product_id: str,
    db: AsyncSession = Depends(get_db),
    redis: Redis = Depends(get_redis),
    current_user: User = Depends(get_current_user),
) -> None:
    pid = _parse_uuid(product_id)
    repo = ProductRepository(db)
    removed = await repo.unlink_from_user(pid, current_user.id)
    if not removed:
        raise HTTPException(status_code=404, detail="Ürün takip listenizde bulunamadı")
    await invalidate_price_cache(redis, product_id)


@router.post("/{product_id}/refresh", response_model=ProductResponse)
async def refresh_product(
    product_id: str,
    db: AsyncSession = Depends(get_db),
    redis: Redis = Depends(get_redis),
    current_user: User = Depends(get_current_user),
) -> ProductResponse:
    pid = _parse_uuid(product_id)
    repo = ProductRepository(db)
    product = await repo.get_by_id(pid)
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")

    if not await repo.is_tracked_by_user(pid, current_user.id):
        raise HTTPException(status_code=403, detail="Bu ürün takip listenizde değil")

    scraper = ScraperService()
    try:
        scraped = await scraper.scrape(product.url, product.platform)
        price = await repo.add_price_history(
            product_id=product.id,
            price=scraped.current_price,
            original_price=scraped.original_price,
            discount_pct=scraped.discount_pct,
            in_stock=scraped.in_stock,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Refresh failed: {e}")

    await set_cached_price(redis, product_id, _price_dict(price))
    return _build_response(product, price)


@router.get("/{product_id}/similar")
async def get_similar_products(
    product_id: str,
    current_user: User = Depends(get_current_user),
) -> dict:
    return {"message": "Similar products coming soon", "products": []}

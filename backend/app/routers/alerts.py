import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.repositories.alert_repository import AlertRepository
from app.repositories.product_repository import ProductRepository
from app.schemas.alert import AlertCreateRequest, AlertResponse, AlertUpdateRequest
from app.services.alert_service import send_alert_email

router = APIRouter()


def _parse_uuid(value: str) -> uuid.UUID:
    try:
        return uuid.UUID(value)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid ID")


@router.post("/", response_model=AlertResponse, status_code=201)
async def create_alert(
    body: AlertCreateRequest,
    db: AsyncSession = Depends(get_db),
) -> AlertResponse:
    repo = AlertRepository(db)
    product_repo = ProductRepository(db)

    product = await product_repo.get_by_id(body.product_id)
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")

    existing = await repo.get_by_product_email(body.product_id, body.email)
    if existing:
        raise HTTPException(status_code=409, detail="Bu ürün için zaten bir alarm var")

    alert = await repo.create(
        product_id=body.product_id,
        email=body.email,
        target_price=body.target_price,
    )
    return AlertResponse.model_validate(alert)


@router.get("/", response_model=list[AlertResponse])
async def list_alerts(
    email: str,
    db: AsyncSession = Depends(get_db),
) -> list[AlertResponse]:
    repo = AlertRepository(db)
    alerts = await repo.list_by_email(email)
    return [AlertResponse.model_validate(a) for a in alerts]


@router.put("/{alert_id}", response_model=AlertResponse)
async def update_alert(
    alert_id: str,
    body: AlertUpdateRequest,
    db: AsyncSession = Depends(get_db),
) -> AlertResponse:
    aid = _parse_uuid(alert_id)
    repo = AlertRepository(db)
    alert = await repo.update(
        aid,
        target_price=body.target_price,
        active=body.active,
    )
    if alert is None:
        raise HTTPException(status_code=404, detail="Alert not found")
    return AlertResponse.model_validate(alert)


@router.delete("/{alert_id}", status_code=204)
async def delete_alert(
    alert_id: str,
    db: AsyncSession = Depends(get_db),
) -> None:
    aid = _parse_uuid(alert_id)
    repo = AlertRepository(db)
    deleted = await repo.delete(aid)
    if not deleted:
        raise HTTPException(status_code=404, detail="Alert not found")


@router.post("/test/{alert_id}", response_model=dict)
async def test_alert(
    alert_id: str,
    db: AsyncSession = Depends(get_db),
) -> dict:
    aid = _parse_uuid(alert_id)
    repo = AlertRepository(db)
    alert = await repo.get_by_id(aid)
    if alert is None:
        raise HTTPException(status_code=404, detail="Alert not found")

    product_repo = ProductRepository(db)
    product = await product_repo.get_by_id(alert.product_id)
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")

    latest = await product_repo.get_latest_price(alert.product_id)
    current_price = float(latest.price) if latest else float(alert.target_price)

    ok = await send_alert_email(alert, product, current_price)
    if not ok:
        raise HTTPException(status_code=500, detail="Mail gönderilemedi")

    return {"sent": True, "to": alert.email}

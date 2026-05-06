import hashlib
import hmac
import json
import logging

from fastapi import APIRouter, Depends, Header, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.core.plans import get_product_limit
from app.core.security import get_current_user
from app.models.user import User
from app.repositories.user_repository import UserRepository

logger = logging.getLogger(__name__)

router = APIRouter()

VARIANT_TO_PLAN: dict[str, str] = {
    settings.LS_VARIANT_PRO: "pro",
    settings.LS_VARIANT_BUSINESS: "business",
}


@router.get("/checkout/{variant}")
async def get_checkout_url(
    variant: str,
    current_user: User = Depends(get_current_user),
) -> dict:
    if variant not in ("pro", "business"):
        raise HTTPException(status_code=400, detail="Invalid plan")

    variant_id = (
        settings.LS_VARIANT_PRO if variant == "pro" else settings.LS_VARIANT_BUSINESS
    )
    checkout_url = (
        f"https://pricewise.lemonsqueezy.com/checkout/buy/{variant_id}"
        f"?checkout[email]={current_user.email}"
    )
    return {"url": checkout_url}


@router.post("/webhook")
async def lemon_squeezy_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db),
    x_signature: str = Header(alias="X-Signature"),
) -> dict:
    body = await request.body()

    expected = hmac.new(
        settings.LEMON_SQUEEZY_WEBHOOK_SECRET.encode(),
        body,
        hashlib.sha256,
    ).hexdigest()

    if not hmac.compare_digest(expected, x_signature):
        raise HTTPException(status_code=401, detail="Invalid webhook signature")

    try:
        payload = json.loads(body)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON")

    event_name = payload.get("meta", {}).get("event_name", "")
    if event_name not in (
        "subscription_created",
        "subscription_updated",
        "subscription_resumed",
        "subscription_cancelled",
        "subscription_expired",
    ):
        return {"status": "ignored"}

    data = payload.get("data", {})
    attributes = data.get("attributes", {})
    customer_id = str(attributes.get("customer_id", ""))
    subscription_id = str(data.get("id", ""))
    variant_id = str(attributes.get("variant_id", ""))
    status = attributes.get("status", "")
    customer_email = attributes.get("user_email", "")

    repo = UserRepository(db)

    user = await repo.get_by_lemon_customer_id(customer_id)
    if user is None and customer_email:
        user = await repo.get_by_email(customer_email)
    if user is None:
        logger.warning("Webhook: no user found for customer_id=%s", customer_id)
        return {"status": "user_not_found"}

    if status in ("cancelled", "expired"):
        await repo.update_plan(
            user,
            plan="free",
            queries_limit=get_product_limit("free"),
            reset_queries_used=True,
            lemon_subscription_id=subscription_id,
        )
    else:
        plan = VARIANT_TO_PLAN.get(variant_id)
        if plan is None:
            logger.warning("Webhook: unknown variant_id=%s", variant_id)
            return {"status": "unknown_variant"}
        await repo.update_plan(
            user,
            plan=plan,
            queries_limit=get_product_limit(plan),
            lemon_customer_id=customer_id,
            lemon_subscription_id=subscription_id,
        )

    await db.commit()
    return {"status": "ok"}

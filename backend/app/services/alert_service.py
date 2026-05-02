import logging

import resend

from app.core.cache import is_alert_sent, mark_alert_sent
from app.core.config import settings
from app.core.database import AsyncSessionLocal
from app.core.redis import get_redis
from app.models.alert import Alert
from app.models.product import Product
from app.repositories.alert_repository import AlertRepository
from app.repositories.product_repository import ProductRepository

logger = logging.getLogger(__name__)


def _build_email_html(
    product_name: str,
    current_price: float,
    target_price: float,
    product_id: str,
) -> str:
    product_url = f"{settings.APP_URL}/products/{product_id}"
    fmt = lambda p: f"₺{p:,.2f}"
    return f"""
<!DOCTYPE html>
<html lang="tr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0f172a;font-family:system-ui,sans-serif;color:#f1f5f9">
  <div style="max-width:520px;margin:40px auto;background:#1e293b;border-radius:16px;overflow:hidden;border:1px solid #334155">
    <div style="background:linear-gradient(135deg,#3b82f6,#6366f1);padding:32px;text-align:center">
      <h1 style="margin:0;font-size:24px;font-weight:700;color:#fff">Fiyat Alarmı</h1>
      <p style="margin:8px 0 0;color:#bfdbfe;font-size:14px">PriceWise AI</p>
    </div>
    <div style="padding:32px">
      <p style="margin:0 0 8px;color:#94a3b8;font-size:14px">Takip ettiğin ürün</p>
      <p style="margin:0 0 24px;font-size:16px;font-weight:600;color:#f1f5f9">{product_name}</p>
      <div style="display:flex;gap:16px;margin-bottom:24px">
        <div style="flex:1;background:#0f172a;border-radius:12px;padding:16px;text-align:center">
          <p style="margin:0 0 4px;color:#94a3b8;font-size:12px">Hedef Fiyat</p>
          <p style="margin:0;font-size:20px;font-weight:700;color:#4ade80">{fmt(target_price)}</p>
        </div>
        <div style="flex:1;background:#0f172a;border-radius:12px;padding:16px;text-align:center">
          <p style="margin:0 0 4px;color:#94a3b8;font-size:12px">Şu Anki Fiyat</p>
          <p style="margin:0;font-size:20px;font-weight:700;color:#f1f5f9">{fmt(current_price)}</p>
        </div>
      </div>
      <a href="{product_url}"
         style="display:block;background:#3b82f6;color:#fff;text-decoration:none;text-align:center;padding:14px 24px;border-radius:10px;font-weight:600;font-size:15px">
        Ürüne Git →
      </a>
    </div>
    <div style="padding:16px 32px;border-top:1px solid #334155;text-align:center">
      <p style="margin:0;color:#475569;font-size:12px">
        Bu alarmı devre dışı bırakmak için
        <a href="{settings.APP_URL}/alerts" style="color:#60a5fa">alarm yönetimi</a> sayfasını ziyaret edin.
      </p>
    </div>
  </div>
</body>
</html>
"""


async def send_alert_email(alert: Alert, product: Product, current_price: float) -> bool:
    resend.api_key = settings.RESEND_API_KEY
    try:
        resend.Emails.send({
            "from": settings.RESEND_FROM_EMAIL,
            "to": [alert.email],
            "subject": f"🔔 Fiyat Düştü: {product.name[:60]}",
            "html": _build_email_html(
                product_name=product.name,
                current_price=current_price,
                target_price=float(alert.target_price),
                product_id=str(alert.product_id),
            ),
        })
        return True
    except Exception:
        logger.error("Resend email failed for alert %s", alert.id, exc_info=True)
        return False


async def check_price_alerts() -> None:
    logger.info("Running price alert check")
    try:
        async with AsyncSessionLocal() as session:
            redis = await get_redis()
            alert_repo = AlertRepository(session)
            product_repo = ProductRepository(session)

            active_alerts = await alert_repo.list_active()
            if not active_alerts:
                return

            sent = 0
            for alert in active_alerts:
                if await is_alert_sent(redis, str(alert.id)):
                    continue

                latest = await product_repo.get_latest_price(alert.product_id)
                if latest is None:
                    continue

                current_price = float(latest.price)
                if current_price > float(alert.target_price):
                    continue

                product = await product_repo.get_by_id(alert.product_id)
                if product is None:
                    continue

                ok = await send_alert_email(alert, product, current_price)
                if ok:
                    await mark_alert_sent(redis, str(alert.id))
                    sent += 1

            logger.info("Price alert check complete — %d email(s) sent", sent)
    except Exception:
        logger.error("Price alert check failed", exc_info=True)

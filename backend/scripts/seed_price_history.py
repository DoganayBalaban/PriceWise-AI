"""
Generates 30 days of realistic mock price history for all products in the DB.
Run: .venv/bin/python scripts/seed_price_history.py
"""
import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

import numpy as np
import pandas as pd
from sqlalchemy import select, text

from app.core.database import AsyncSessionLocal
from app.models.price_history import PriceHistory
from app.models.product import Product


def generate_price_series(base_price: float, days: int = 30) -> pd.DataFrame:
    """
    Simulates realistic e-commerce price movement:
    - Random walk with mean reversion around base price
    - Occasional flash sales (10-30% drop lasting 1-3 days)
    - Daily granularity (one data point per day)
    """
    rng = np.random.default_rng()

    prices = [base_price]
    for _ in range(days - 1):
        prev = prices[-1]
        # mean-reversion: pull toward base_price
        drift = 0.02 * (base_price - prev)
        noise = rng.normal(0, base_price * 0.015)
        prices.append(max(prev + drift + noise, base_price * 0.5))

    # inject 1-2 flash sales
    n_sales = rng.integers(1, 3)
    for _ in range(n_sales):
        start = rng.integers(0, days - 3)
        duration = rng.integers(1, 4)
        discount = rng.uniform(0.10, 0.30)
        for d in range(start, min(start + duration, days)):
            prices[d] = prices[d] * (1 - discount)

    now = pd.Timestamp.now("UTC").tz_localize(None)
    timestamps = [now - pd.Timedelta(days=days - 1 - i) for i in range(days)]

    return pd.DataFrame({"scraped_at": timestamps, "price": [round(p, 2) for p in prices]})


async def seed():
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(Product))
        products = result.scalars().all()

        if not products:
            print("Veritabanında ürün yok. Önce bir ürün ekleyin.")
            return

        total_inserted = 0

        for product in products:
            # fetch latest real price as base
            latest = await session.execute(
                text(
                    "SELECT price FROM price_history "
                    "WHERE product_id = :pid "
                    "ORDER BY scraped_at DESC LIMIT 1"
                ),
                {"pid": str(product.id)},
            )
            row = latest.first()
            base_price = float(row[0]) if row else 1000.0

            df = generate_price_series(base_price, days=30)

            # delete existing mock data older than 1 day to avoid double-seeding
            await session.execute(
                text(
                    "DELETE FROM price_history "
                    "WHERE product_id = :pid "
                    "AND scraped_at < NOW() - INTERVAL '1 hour'"
                ),
                {"pid": str(product.id)},
            )

            for _, row in df.iterrows():
                price = float(row["price"])
                # simulate original price / discount for lower prices
                if price < base_price * 0.95:
                    original_price = round(base_price * 1.05, 2)
                    discount_pct = round((1 - price / original_price) * 100, 2)
                else:
                    original_price = None
                    discount_pct = None

                entry = PriceHistory(
                    product_id=product.id,
                    price=price,
                    original_price=original_price,
                    discount_pct=discount_pct,
                    in_stock=True,
                    scraped_at=row["scraped_at"].to_pydatetime().replace(tzinfo=None),
                )
                session.add(entry)
                total_inserted += 1

            print(f"  {product.name[:60]}: {len(df)} kayıt (base ₺{base_price:,.2f})")

        await session.commit()
        print(f"\nToplam {total_inserted} fiyat geçmişi kaydı eklendi.")


if __name__ == "__main__":
    print("Fiyat geçmişi seed verisi oluşturuluyor...\n")
    asyncio.run(seed())

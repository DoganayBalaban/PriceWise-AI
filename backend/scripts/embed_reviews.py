"""
CLI: embed unprocessed reviews into Pinecone.

Usage:
    # All products with pending reviews
    .venv/bin/python scripts/embed_reviews.py

    # Single product
    .venv/bin/python scripts/embed_reviews.py --product-id <uuid>
"""
import argparse
import asyncio
import sys
import uuid
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import select

from app.core.database import AsyncSessionLocal
from app.models.product import Product
from app.models.review import Review
from app.services.review_service import embed_pending_reviews


async def run(product_id: uuid.UUID | None) -> None:
    async with AsyncSessionLocal() as session:
        if product_id:
            result = await session.execute(
                select(Product).where(Product.id == product_id)
            )
            products = [p for p in result.scalars().all() if p]
        else:
            # Find products that have at least one un-embedded review
            result = await session.execute(
                select(Product)
                .join(Review, Review.product_id == Product.id)
                .where(Review.pinecone_id.is_(None))
                .distinct()
            )
            products = list(result.scalars().all())

    if not products:
        print("No products with pending reviews found.")
        return

    print(f"Processing {len(products)} product(s)...")
    for product in products:
        print(f"  → {product.name or product.id} ({product.platform})")
        await embed_pending_reviews(product.id, product.platform)

    print("Done.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--product-id", type=str, default=None)
    args = parser.parse_args()

    pid = uuid.UUID(args.product_id) if args.product_id else None
    asyncio.run(run(pid))

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.plans import get_product_limit
from app.core.security import get_current_user
from app.models.user import User
from app.repositories.product_repository import ProductRepository

router = APIRouter()


@router.get("/me")
async def get_me(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    repo = ProductRepository(db)
    product_count = await repo.count_by_user(current_user.id)
    product_limit = get_product_limit(current_user.plan)
    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "name": current_user.name,
        "plan": current_user.plan,
        "queries_used": current_user.queries_used,
        "queries_limit": current_user.queries_limit,
        "product_count": product_count,
        "product_limit": product_limit,
    }

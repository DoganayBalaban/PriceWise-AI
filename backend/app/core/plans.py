PLAN_PRODUCT_LIMITS: dict[str, int] = {"free": 5, "pro": 100, "business": 9999}


def get_product_limit(plan: str) -> int:
    return PLAN_PRODUCT_LIMITS.get(plan, 5)

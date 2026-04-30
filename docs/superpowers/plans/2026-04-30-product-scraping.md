# Product Scraping & Registration — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Trendyol ve Hepsiburada URL'lerinden Playwright ile ürün scrape edip Postgres'e kaydeden backend + dashboard UI.

**Architecture:** FastAPI async backend — Playwright scraper servisi, SQLAlchemy 2.0 async ORM, Alembic migrations. Next.js 16 App Router frontend — TanStack Query hooks, ProductCard / Dashboard bileşenleri.

**Tech Stack:** `playwright`, `sqlalchemy[asyncio]`, `asyncpg`, `alembic`, `pytest-asyncio`, `aiosqlite`, Next.js 16, TanStack Query, Axios

---

## Dosya Haritası

### Backend (yeni / değişen)
| Dosya | İşlem | Sorumluluk |
|-------|-------|-----------|
| `backend/requirements.txt` | Modify | playwright, sqlalchemy, asyncpg, alembic ekle |
| `backend/requirements-dev.txt` | Modify | pytest-asyncio, aiosqlite, httpx ekle |
| `backend/app/core/__init__.py` | Create | boş |
| `backend/app/core/config.py` | Create | Settings — DB URL, FREE_PRODUCT_LIMIT |
| `backend/app/core/auth.py` | Create | X-User-Id stub dependency |
| `backend/app/database.py` | Create | async engine + session factory + get_session |
| `backend/app/models/__init__.py` | Modify | tüm modelleri import et |
| `backend/app/models/product.py` | Create | Product + PriceHistory ORM |
| `backend/app/models/user.py` | Create | User ORM |
| `backend/app/models/review.py` | Create | Review ORM |
| `backend/app/models/analysis.py` | Create | AnalysisHistory ORM |
| `backend/app/schemas/product.py` | Replace | ProductCreate, ProductResponse, ProductListItem |
| `backend/app/services/scraper.py` | Replace | ScraperService, TrendyolScraper, HepsiburadaScraper |
| `backend/app/routers/products.py` | Create | 6 endpoint (POST/GET/DELETE/refresh/similar) |
| `backend/app/main.py` | Modify | products router ekle, DB lifespan |
| `backend/alembic.ini` | Create | Alembic config |
| `backend/alembic/env.py` | Create | async Alembic env |
| `backend/alembic/versions/001_initial.py` | Create | 5 tablo migration |
| `backend/tests/conftest.py` | Create | pytest fixtures: engine, session, client |
| `backend/tests/test_scraper.py` | Create | ScraperService unit testleri |
| `backend/tests/test_products.py` | Create | Products router testleri |

### Frontend (yeni / değişen)
| Dosya | İşlem | Sorumluluk |
|-------|-------|-----------|
| `frontend/src/lib/api.ts` | Modify | products endpoint'leri ekle |
| `frontend/src/lib/query-keys.ts` | Modify | product query keys ekle |
| `frontend/src/hooks/use-add-product.ts` | Create | POST /api/products mutation |
| `frontend/src/hooks/use-products.ts` | Modify | GET /api/products query (güncelle) |
| `frontend/src/hooks/use-refresh-product.ts` | Create | POST /api/products/{id}/refresh |
| `frontend/src/hooks/use-delete-product.ts` | Create | DELETE /api/products/{id} |
| `frontend/src/components/UrlInput.tsx` | Create | URL form + submit |
| `frontend/src/components/ProductCard.tsx` | Create | ürün kartı: görsel, fiyat, indirim, badge |
| `frontend/src/components/ProductList.tsx` | Create | ürün grid'i + boş durum |
| `frontend/src/app/page.tsx` | Modify | UrlInput + spinner + preview kartı |
| `frontend/src/app/dashboard/page.tsx` | Create | takip edilen ürünler dashboard |

---

## Task 1: Backend Bağımlılıkları + Config

**Files:**
- Modify: `backend/requirements.txt`
- Modify: `backend/requirements-dev.txt`
- Create: `backend/app/core/__init__.py`
- Create: `backend/app/core/config.py`
- Create: `backend/app/core/auth.py`

- [ ] **Step 1: requirements.txt güncelle**

```text
# backend/requirements.txt
fastapi==0.115.6
uvicorn[standard]==0.32.1
pydantic==2.10.4
pydantic-settings==2.7.0
httpx==0.28.1
python-dotenv==1.0.1
sqlalchemy[asyncio]==2.0.36
asyncpg==0.30.0
alembic==1.14.0
playwright==1.49.0
```

- [ ] **Step 2: requirements-dev.txt güncelle**

```text
# backend/requirements-dev.txt
-r requirements.txt
pytest==8.3.4
pytest-asyncio==0.25.0
aiosqlite==0.20.0
ruff==0.9.0
```

- [ ] **Step 3: Playwright Chromium indir**

```bash
cd backend && .venv/bin/pip install -r requirements.txt && .venv/bin/playwright install chromium
```

Beklenen: `Chromium 131.0.xxxx downloaded to ...`

- [ ] **Step 4: app/core/__init__.py oluştur**

```python
# backend/app/core/__init__.py
```

- [ ] **Step 5: app/core/config.py oluştur**

```python
# backend/app/core/config.py
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql+asyncpg://pw_user:pw_pass@localhost:5432/pricewise"
    free_product_limit: int = 5
    scraper_timeout_ms: int = 8000

    class Config:
        env_file = ".env"


settings = Settings()
```

- [ ] **Step 6: app/core/auth.py oluştur**

```python
# backend/app/core/auth.py
from fastapi import Header, HTTPException


async def get_current_user_id(x_user_id: str = Header(default="anonymous")) -> str:
    """Auth stub — JWT ile değiştirilecek."""
    return x_user_id
```

- [ ] **Step 7: Commit**

```bash
git add backend/requirements.txt backend/requirements-dev.txt backend/app/core/
git commit -m "feat(backend): add dependencies and core config"
```

---

## Task 2: Database Modülü

**Files:**
- Create: `backend/app/database.py`

- [ ] **Step 1: app/database.py oluştur**

```python
# backend/app/database.py
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
from app.core.config import settings


class Base(DeclarativeBase):
    pass


engine = create_async_engine(settings.database_url, echo=False)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)


async def get_session() -> AsyncSession:  # type: ignore[return]
    async with AsyncSessionLocal() as session:
        yield session
```

- [ ] **Step 2: Commit**

```bash
git add backend/app/database.py
git commit -m "feat(backend): add async SQLAlchemy database module"
```

---

## Task 3: ORM Modelleri

**Files:**
- Create: `backend/app/models/product.py`
- Create: `backend/app/models/user.py`
- Create: `backend/app/models/review.py`
- Create: `backend/app/models/analysis.py`
- Modify: `backend/app/models/__init__.py`

- [ ] **Step 1: app/models/product.py oluştur**

```python
# backend/app/models/product.py
import uuid
from datetime import datetime
from decimal import Decimal
from sqlalchemy import String, Text, Numeric, Boolean, ForeignKey, DateTime, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class Product(Base):
    __tablename__ = "products"

    id: Mapped[uuid.UUID] = mapped_column(default=uuid.uuid4, primary_key=True)
    url: Mapped[str] = mapped_column(Text, unique=True, nullable=False)
    platform: Mapped[str] = mapped_column(String(20), nullable=False)
    name: Mapped[str] = mapped_column(Text, nullable=False)
    brand: Mapped[str | None] = mapped_column(Text)
    category: Mapped[str | None] = mapped_column(Text)
    image_url: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    price_history: Mapped[list["PriceHistory"]] = relationship(
        back_populates="product", cascade="all, delete-orphan", order_by="PriceHistory.scraped_at.desc()"
    )


class PriceHistory(Base):
    __tablename__ = "price_history"

    id: Mapped[uuid.UUID] = mapped_column(default=uuid.uuid4, primary_key=True)
    product_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    price: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    original_price: Mapped[Decimal | None] = mapped_column(Numeric(10, 2))
    discount_pct: Mapped[Decimal | None] = mapped_column(Numeric(5, 2))
    in_stock: Mapped[bool] = mapped_column(Boolean, default=True)
    seller_name: Mapped[str | None] = mapped_column(Text)
    scraped_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

    product: Mapped["Product"] = relationship(back_populates="price_history")

    __table_args__ = (
        Index("idx_price_history_product", "product_id", "scraped_at"),
    )
```

- [ ] **Step 2: app/models/user.py oluştur**

```python
# backend/app/models/user.py
import uuid
from datetime import datetime
from sqlalchemy import String, Text, Integer, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(default=uuid.uuid4, primary_key=True)
    email: Mapped[str] = mapped_column(Text, unique=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(Text, nullable=False)
    plan: Mapped[str] = mapped_column(String(10), default="free")
    queries_used: Mapped[int] = mapped_column(Integer, default=0)
    queries_limit: Mapped[int] = mapped_column(Integer, default=5)
    lemon_customer_id: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
```

- [ ] **Step 3: app/models/review.py oluştur**

```python
# backend/app/models/review.py
import uuid
from datetime import datetime, date
from decimal import Decimal
from sqlalchemy import Text, SmallInteger, Numeric, Boolean, ForeignKey, DateTime, Date, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class Review(Base):
    __tablename__ = "reviews"

    id: Mapped[uuid.UUID] = mapped_column(default=uuid.uuid4, primary_key=True)
    product_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    rating: Mapped[int | None] = mapped_column(SmallInteger)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    sentiment_label: Mapped[str | None] = mapped_column(String(10))
    sentiment_score: Mapped[Decimal | None] = mapped_column(Numeric(4, 3))
    pinecone_id: Mapped[str | None] = mapped_column(Text)
    verified: Mapped[bool] = mapped_column(Boolean, default=False)
    review_date: Mapped[date | None] = mapped_column(Date)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
```

- [ ] **Step 4: app/models/analysis.py oluştur**

```python
# backend/app/models/analysis.py
import uuid
from datetime import datetime
from sqlalchemy import Text, Integer, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base


class AnalysisHistory(Base):
    __tablename__ = "analysis_history"

    id: Mapped[uuid.UUID] = mapped_column(default=uuid.uuid4, primary_key=True)
    user_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("users.id"))
    product_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("products.id"))
    query: Mapped[str] = mapped_column(Text, nullable=False)
    result: Mapped[dict | None] = mapped_column(JSONB)
    tokens_used: Mapped[int | None] = mapped_column(Integer)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
```

- [ ] **Step 5: app/models/__init__.py güncelle**

```python
# backend/app/models/__init__.py
from app.models.product import Product, PriceHistory
from app.models.user import User
from app.models.review import Review
from app.models.analysis import AnalysisHistory

__all__ = ["Product", "PriceHistory", "User", "Review", "AnalysisHistory"]
```

- [ ] **Step 6: Commit**

```bash
git add backend/app/models/
git commit -m "feat(backend): add SQLAlchemy ORM models for all tables"
```

---

## Task 4: Alembic Migration

**Files:**
- Create: `backend/alembic.ini`
- Create: `backend/alembic/env.py`
- Create: `backend/alembic/script.py.mako`
- Create: `backend/alembic/versions/001_initial_schema.py`

- [ ] **Step 1: Alembic init**

```bash
cd backend && .venv/bin/alembic init alembic
```

Beklenen: `Creating directory .../alembic ...  done`

- [ ] **Step 2: alembic.ini düzenle — sqlalchemy.url satırını bul ve değiştir**

`alembic.ini` içinde:
```ini
sqlalchemy.url = postgresql+asyncpg://pw_user:pw_pass@localhost:5432/pricewise
```

- [ ] **Step 3: alembic/env.py'yi async destekli yeniden yaz**

```python
# backend/alembic/env.py
import asyncio
from logging.config import fileConfig
from sqlalchemy.ext.asyncio import create_async_engine
from alembic import context
from app.database import Base
from app.models import Product, PriceHistory, User, Review, AnalysisHistory  # noqa: F401

config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(url=url, target_metadata=target_metadata, literal_binds=True)
    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection):
    context.configure(connection=connection, target_metadata=target_metadata)
    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations() -> None:
    connectable = create_async_engine(config.get_main_option("sqlalchemy.url"))
    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)
    await connectable.dispose()


def run_migrations_online() -> None:
    asyncio.run(run_async_migrations())


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
```

- [ ] **Step 4: İlk migration oluştur (Postgres ayakta olmalı: `docker compose up postgres -d`)**

```bash
cd backend && .venv/bin/alembic revision --autogenerate -m "initial_schema"
```

Beklenen: `Generating .../alembic/versions/xxxx_initial_schema.py ... done`

- [ ] **Step 5: Migration uygula**

```bash
cd backend && .venv/bin/alembic upgrade head
```

Beklenen: `Running upgrade  -> xxxx, initial_schema`

- [ ] **Step 6: Commit**

```bash
git add backend/alembic.ini backend/alembic/
git commit -m "feat(backend): add Alembic with initial schema migration"
```

---

## Task 5: Pydantic Şemaları

**Files:**
- Replace: `backend/app/schemas/product.py`

- [ ] **Step 1: Mevcut product şemasını tamamen yeniden yaz**

```python
# backend/app/schemas/product.py
import uuid
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, HttpUrl, field_validator


class ProductAddRequest(BaseModel):
    url: HttpUrl

    @field_validator("url", mode="after")
    @classmethod
    def validate_platform(cls, v: HttpUrl) -> HttpUrl:
        url_str = str(v)
        if "trendyol.com" not in url_str and "hepsiburada.com" not in url_str:
            raise ValueError("Only Trendyol and Hepsiburada URLs are supported")
        return v


class PriceSnapshot(BaseModel):
    price: Decimal
    original_price: Decimal | None
    discount_pct: Decimal | None
    in_stock: bool
    seller_name: str | None
    scraped_at: datetime

    model_config = {"from_attributes": True}


class ProductResponse(BaseModel):
    id: uuid.UUID
    url: str
    platform: str
    name: str
    brand: str | None
    category: str | None
    image_url: str | None
    created_at: datetime
    latest_price: PriceSnapshot | None = None

    model_config = {"from_attributes": True}


class ProductListResponse(BaseModel):
    items: list[ProductResponse]
    total: int
    page: int
    limit: int
```

- [ ] **Step 2: Commit**

```bash
git add backend/app/schemas/product.py
git commit -m "feat(backend): update product Pydantic schemas"
```

---

## Task 6: ScraperService (TDD)

**Files:**
- Replace: `backend/app/services/scraper.py`
- Create: `backend/tests/__init__.py`
- Create: `backend/tests/test_scraper.py`
- Create: `backend/pytest.ini`

- [ ] **Step 1: pytest.ini oluştur**

```ini
# backend/pytest.ini
[pytest]
asyncio_mode = auto
testpaths = tests
```

- [ ] **Step 2: tests/__init__.py oluştur**

```python
# backend/tests/__init__.py
```

- [ ] **Step 3: Başarısız testleri yaz**

```python
# backend/tests/test_scraper.py
import pytest
from decimal import Decimal
from unittest.mock import AsyncMock, MagicMock, patch
from app.services.scraper import ScraperService, ScrapeResult, TrendyolScraper, HepsiburadaScraper


def test_detect_platform_trendyol():
    assert ScraperService().detect_platform("https://www.trendyol.com/p/urun") == "trendyol"


def test_detect_platform_hepsiburada():
    assert ScraperService().detect_platform("https://www.hepsiburada.com/p/urun") == "hepsiburada"


def test_detect_platform_unknown_returns_none():
    assert ScraperService().detect_platform("https://www.amazon.com/p/urun") is None


@pytest.mark.asyncio
async def test_scrape_dispatches_to_trendyol():
    service = ScraperService()
    mock_result = ScrapeResult(
        name="Test", brand=None, category=None, image_url=None,
        price=Decimal("100"), original_price=None, discount_pct=None,
        in_stock=True, seller_name=None,
    )
    with patch.object(TrendyolScraper, "scrape", return_value=mock_result) as mock_scrape:
        result = await service.scrape("https://www.trendyol.com/p/test")
    mock_scrape.assert_called_once_with("https://www.trendyol.com/p/test")
    assert result == mock_result


@pytest.mark.asyncio
async def test_scrape_raises_for_unsupported_platform():
    with pytest.raises(ValueError, match="Unsupported platform"):
        await ScraperService().scrape("https://www.amazon.com/p/test")


@pytest.mark.asyncio
async def test_trendyol_scraper_uses_window_state():
    window_state = {
        "product": {
            "name": "iPhone 15",
            "brand": {"name": "Apple"},
            "category": {"hierarchy": [{"name": "Elektronik"}, {"name": "Telefon"}]},
            "images": ["img/test.jpg"],
            "priceInfo": {"price": 42999.0, "originalPrice": 49999.0, "discountRatio": 14},
            "hasStock": True,
            "merchant": {"name": "Trendyol"},
        }
    }
    mock_page = AsyncMock()
    mock_page.evaluate = AsyncMock(return_value=window_state)
    mock_page.set_default_timeout = MagicMock()
    mock_page.goto = AsyncMock()

    mock_browser = AsyncMock()
    mock_browser.new_page = AsyncMock(return_value=mock_page)
    mock_browser.close = AsyncMock()

    mock_playwright = AsyncMock()
    mock_playwright.chromium.launch = AsyncMock(return_value=mock_browser)
    mock_playwright.__aenter__ = AsyncMock(return_value=mock_playwright)
    mock_playwright.__aexit__ = AsyncMock(return_value=False)

    with patch("app.services.scraper.async_playwright", return_value=mock_playwright):
        result = await TrendyolScraper().scrape("https://www.trendyol.com/test")

    assert result.name == "iPhone 15"
    assert result.brand == "Apple"
    assert result.category == "Elektronik > Telefon"
    assert result.price == Decimal("42999.0")
    assert result.original_price == Decimal("49999.0")
    assert result.discount_pct == Decimal("14")
    assert result.in_stock is True
    assert result.seller_name == "Trendyol"
    assert result.image_url == "https://cdn.dsmcdn.com/img/test.jpg"


@pytest.mark.asyncio
async def test_hepsiburada_scraper_uses_ld_json():
    ld_json = {
        "@type": "Product",
        "name": "Samsung Galaxy S24",
        "brand": {"name": "Samsung"},
        "image": "https://img.hepsiburada.com/test.jpg",
        "offers": {
            "price": "24999",
            "priceCurrency": "TRY",
            "availability": "https://schema.org/InStock",
            "seller": {"name": "HB Store"},
        },
    }
    mock_page = AsyncMock()
    mock_page.evaluate = AsyncMock(return_value=ld_json)
    mock_page.set_default_timeout = MagicMock()
    mock_page.goto = AsyncMock()

    mock_browser = AsyncMock()
    mock_browser.new_page = AsyncMock(return_value=mock_page)
    mock_browser.close = AsyncMock()

    mock_playwright = AsyncMock()
    mock_playwright.chromium.launch = AsyncMock(return_value=mock_browser)
    mock_playwright.__aenter__ = AsyncMock(return_value=mock_playwright)
    mock_playwright.__aexit__ = AsyncMock(return_value=False)

    with patch("app.services.scraper.async_playwright", return_value=mock_playwright):
        result = await HepsiburadaScraper().scrape("https://www.hepsiburada.com/test")

    assert result.name == "Samsung Galaxy S24"
    assert result.brand == "Samsung"
    assert result.price == Decimal("24999")
    assert result.in_stock is True
    assert result.seller_name == "HB Store"
```

- [ ] **Step 4: Testlerin başarısız olduğunu doğrula**

```bash
cd backend && .venv/bin/pytest tests/test_scraper.py -v 2>&1 | head -30
```

Beklenen: `ImportError` veya `ModuleNotFoundError` (scraper henüz yok)

- [ ] **Step 5: ScraperService'i implement et**

```python
# backend/app/services/scraper.py
from dataclasses import dataclass
from decimal import Decimal
from playwright.async_api import async_playwright
from app.core.config import settings


@dataclass
class ScrapeResult:
    name: str
    brand: str | None
    category: str | None
    image_url: str | None
    price: Decimal
    original_price: Decimal | None
    discount_pct: Decimal | None
    in_stock: bool
    seller_name: str | None


class ScraperService:
    def detect_platform(self, url: str) -> str | None:
        if "trendyol.com" in url:
            return "trendyol"
        if "hepsiburada.com" in url:
            return "hepsiburada"
        return None

    async def scrape(self, url: str) -> ScrapeResult:
        platform = self.detect_platform(url)
        if platform == "trendyol":
            return await TrendyolScraper().scrape(url)
        if platform == "hepsiburada":
            return await HepsiburadaScraper().scrape(url)
        raise ValueError(f"Unsupported platform for URL: {url}")


class TrendyolScraper:
    async def scrape(self, url: str) -> ScrapeResult:
        async with async_playwright() as p:
            browser = await p.chromium.launch(
                headless=True,
                args=["--no-sandbox", "--disable-dev-shm-usage"],
            )
            try:
                page = await browser.new_page()
                page.set_default_timeout(settings.scraper_timeout_ms)
                await page.goto(url, wait_until="domcontentloaded")

                state = await page.evaluate(
                    "() => window.__PRODUCT_DETAIL_APP_INITIAL_STATE__ || null"
                )

                if state and state.get("product"):
                    return self._parse_window_state(state["product"])

                raise ValueError("Could not extract product data from this URL")
            finally:
                await browser.close()

    def _parse_window_state(self, product: dict) -> ScrapeResult:
        price_info = product.get("priceInfo", {})
        images = product.get("images", [])
        image_url = f"https://cdn.dsmcdn.com/{images[0]}" if images else None

        hierarchy = product.get("category", {}).get("hierarchy", [])
        category = " > ".join(h.get("name", "") for h in hierarchy) if hierarchy else None

        return ScrapeResult(
            name=product.get("name", ""),
            brand=product.get("brand", {}).get("name"),
            category=category,
            image_url=image_url,
            price=Decimal(str(price_info.get("price", 0))),
            original_price=Decimal(str(price_info["originalPrice"])) if price_info.get("originalPrice") else None,
            discount_pct=Decimal(str(price_info["discountRatio"])) if price_info.get("discountRatio") else None,
            in_stock=product.get("hasStock", True),
            seller_name=product.get("merchant", {}).get("name"),
        )


class HepsiburadaScraper:
    async def scrape(self, url: str) -> ScrapeResult:
        async with async_playwright() as p:
            browser = await p.chromium.launch(
                headless=True,
                args=["--no-sandbox", "--disable-dev-shm-usage"],
            )
            try:
                page = await browser.new_page()
                page.set_default_timeout(settings.scraper_timeout_ms)
                await page.goto(url, wait_until="domcontentloaded")

                ld_json = await page.evaluate("""() => {
                    const script = document.querySelector('script[type="application/ld+json"]');
                    try { return script ? JSON.parse(script.textContent) : null; }
                    catch { return null; }
                }""")

                if ld_json and ld_json.get("name"):
                    return self._parse_ld_json(ld_json)

                raise ValueError("Could not extract product data from this URL")
            finally:
                await browser.close()

    def _parse_ld_json(self, data: dict) -> ScrapeResult:
        offers = data.get("offers", {})
        availability = offers.get("availability", "")
        in_stock = "InStock" in availability or "OutOfStock" not in availability

        seller = offers.get("seller", {})
        seller_name = seller.get("name") if isinstance(seller, dict) else None

        return ScrapeResult(
            name=data.get("name", ""),
            brand=data.get("brand", {}).get("name") if isinstance(data.get("brand"), dict) else None,
            category=None,
            image_url=data.get("image"),
            price=Decimal(str(offers.get("price", 0))),
            original_price=None,
            discount_pct=None,
            in_stock=in_stock,
            seller_name=seller_name,
        )
```

- [ ] **Step 6: Testlerin geçtiğini doğrula**

```bash
cd backend && .venv/bin/pytest tests/test_scraper.py -v
```

Beklenen: `6 passed`

- [ ] **Step 7: Commit**

```bash
git add backend/app/services/scraper.py backend/tests/ backend/pytest.ini
git commit -m "feat(backend): implement ScraperService with Playwright (TDD)"
```

---

## Task 7: Products Router (TDD)

**Files:**
- Create: `backend/tests/conftest.py`
- Create: `backend/tests/test_products.py`
- Create: `backend/app/routers/products.py`

- [ ] **Step 1: tests/conftest.py oluştur**

```python
# backend/tests/conftest.py
import pytest
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from app.database import Base, get_session
from app.main import app

TEST_DB_URL = "sqlite+aiosqlite:///./test.db"


@pytest.fixture(scope="session")
async def engine():
    _engine = create_async_engine(TEST_DB_URL)
    async with _engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield _engine
    async with _engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await _engine.dispose()


@pytest.fixture
async def session(engine):
    factory = async_sessionmaker(engine, expire_on_commit=False)
    async with factory() as s:
        yield s
        await s.rollback()


@pytest.fixture
async def client(session):
    async def override():
        yield session

    app.dependency_overrides[get_session] = override
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        yield c
    app.dependency_overrides.clear()
```

- [ ] **Step 2: Başarısız router testlerini yaz**

```python
# backend/tests/test_products.py
import pytest
from decimal import Decimal
from unittest.mock import patch
from app.services.scraper import ScrapeResult


MOCK_SCRAPE = ScrapeResult(
    name="iPhone 15",
    brand="Apple",
    category="Elektronik > Telefon",
    image_url="https://cdn.dsmcdn.com/img/test.jpg",
    price=Decimal("42999.00"),
    original_price=Decimal("49999.00"),
    discount_pct=Decimal("14"),
    in_stock=True,
    seller_name="Trendyol",
)


@pytest.mark.asyncio
async def test_post_product_returns_201(client):
    with patch("app.routers.products.ScraperService.scrape", return_value=MOCK_SCRAPE):
        resp = await client.post(
            "/api/products",
            json={"url": "https://www.trendyol.com/apple/iphone-15-p-123456789"},
            headers={"x-user-id": "user-1"},
        )
    assert resp.status_code == 201
    data = resp.json()
    assert data["name"] == "iPhone 15"
    assert data["platform"] == "trendyol"
    assert data["latest_price"]["price"] == "42999.00"


@pytest.mark.asyncio
async def test_post_product_duplicate_url_returns_200(client):
    with patch("app.routers.products.ScraperService.scrape", return_value=MOCK_SCRAPE):
        await client.post(
            "/api/products",
            json={"url": "https://www.trendyol.com/apple/iphone-15-p-999999999"},
            headers={"x-user-id": "user-1"},
        )
        resp = await client.post(
            "/api/products",
            json={"url": "https://www.trendyol.com/apple/iphone-15-p-999999999"},
            headers={"x-user-id": "user-1"},
        )
    assert resp.status_code == 200


@pytest.mark.asyncio
async def test_post_product_unsupported_url_returns_422(client):
    resp = await client.post(
        "/api/products",
        json={"url": "https://www.amazon.com/product/123"},
        headers={"x-user-id": "user-1"},
    )
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_get_products_returns_list(client):
    resp = await client.get("/api/products", headers={"x-user-id": "user-1"})
    assert resp.status_code == 200
    data = resp.json()
    assert "items" in data
    assert "total" in data


@pytest.mark.asyncio
async def test_get_product_by_id(client):
    with patch("app.routers.products.ScraperService.scrape", return_value=MOCK_SCRAPE):
        create_resp = await client.post(
            "/api/products",
            json={"url": "https://www.trendyol.com/apple/iphone-detail-test-p-111"},
            headers={"x-user-id": "user-1"},
        )
    product_id = create_resp.json()["id"]
    resp = await client.get(f"/api/products/{product_id}", headers={"x-user-id": "user-1"})
    assert resp.status_code == 200
    assert resp.json()["id"] == product_id


@pytest.mark.asyncio
async def test_delete_product(client):
    with patch("app.routers.products.ScraperService.scrape", return_value=MOCK_SCRAPE):
        create_resp = await client.post(
            "/api/products",
            json={"url": "https://www.trendyol.com/apple/to-delete-p-222"},
            headers={"x-user-id": "user-1"},
        )
    product_id = create_resp.json()["id"]
    del_resp = await client.delete(f"/api/products/{product_id}", headers={"x-user-id": "user-1"})
    assert del_resp.status_code == 204
    get_resp = await client.get(f"/api/products/{product_id}", headers={"x-user-id": "user-1"})
    assert get_resp.status_code == 404


@pytest.mark.asyncio
async def test_refresh_product_adds_price_history(client):
    with patch("app.routers.products.ScraperService.scrape", return_value=MOCK_SCRAPE):
        create_resp = await client.post(
            "/api/products",
            json={"url": "https://www.trendyol.com/apple/to-refresh-p-333"},
            headers={"x-user-id": "user-1"},
        )
        product_id = create_resp.json()["id"]
        resp = await client.post(
            f"/api/products/{product_id}/refresh",
            headers={"x-user-id": "user-1"},
        )
    assert resp.status_code == 200
    assert resp.json()["latest_price"] is not None


@pytest.mark.asyncio
async def test_similar_returns_stub(client):
    with patch("app.routers.products.ScraperService.scrape", return_value=MOCK_SCRAPE):
        create_resp = await client.post(
            "/api/products",
            json={"url": "https://www.trendyol.com/apple/similar-test-p-444"},
            headers={"x-user-id": "user-1"},
        )
    product_id = create_resp.json()["id"]
    resp = await client.get(f"/api/products/{product_id}/similar", headers={"x-user-id": "user-1"})
    assert resp.status_code == 200
    assert resp.json() == {"items": [], "message": "Similarity search coming soon"}
```

- [ ] **Step 3: Testlerin başarısız olduğunu doğrula**

```bash
cd backend && .venv/bin/pytest tests/test_products.py -v 2>&1 | head -20
```

Beklenen: hata (router yok)

- [ ] **Step 4: app/routers/products.py oluştur**

```python
# backend/app/routers/products.py
import uuid
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from app.database import get_session
from app.core.auth import get_current_user_id
from app.core.config import settings
from app.models.product import Product, PriceHistory
from app.schemas.product import ProductAddRequest, ProductResponse, ProductListResponse, PriceSnapshot
from app.services.scraper import ScraperService

router = APIRouter()
_scraper = ScraperService()


def _to_response(product: Product) -> ProductResponse:
    latest = product.price_history[0] if product.price_history else None
    return ProductResponse(
        id=product.id,
        url=product.url,
        platform=product.platform,
        name=product.name,
        brand=product.brand,
        category=product.category,
        image_url=product.image_url,
        created_at=product.created_at,
        latest_price=PriceSnapshot.model_validate(latest) if latest else None,
    )


@router.post("", status_code=status.HTTP_201_CREATED, response_model=ProductResponse)
async def add_product(
    body: ProductAddRequest,
    session: Annotated[AsyncSession, Depends(get_session)],
    user_id: Annotated[str, Depends(get_current_user_id)],
):
    url_str = str(body.url)
    platform = _scraper.detect_platform(url_str)
    if platform is None:
        raise HTTPException(status_code=400, detail="Only Trendyol and Hepsiburada URLs are supported")

    # Duplicate check
    existing = await session.scalar(select(Product).where(Product.url == url_str))
    if existing:
        result = await session.scalar(
            select(Product).where(Product.id == existing.id).options(selectinload(Product.price_history))
        )
        from fastapi.responses import JSONResponse
        from fastapi.encoders import jsonable_encoder
        return JSONResponse(status_code=200, content=jsonable_encoder(_to_response(result)))

    # Count check (free limit)
    count = await session.scalar(select(func.count()).select_from(Product))
    if count >= settings.free_product_limit:
        raise HTTPException(status_code=429, detail=f"Free plan limit reached ({settings.free_product_limit} products)")

    # Scrape
    try:
        scraped = await _scraper.scrape(url_str)
    except TimeoutError:
        raise HTTPException(status_code=504, detail="Product page could not be loaded in time")
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))

    product = Product(
        url=url_str,
        platform=platform,
        name=scraped.name,
        brand=scraped.brand,
        category=scraped.category,
        image_url=scraped.image_url,
    )
    session.add(product)
    await session.flush()

    price_entry = PriceHistory(
        product_id=product.id,
        price=scraped.price,
        original_price=scraped.original_price,
        discount_pct=scraped.discount_pct,
        in_stock=scraped.in_stock,
        seller_name=scraped.seller_name,
    )
    session.add(price_entry)
    await session.commit()
    await session.refresh(product)

    result = await session.scalar(
        select(Product).where(Product.id == product.id).options(selectinload(Product.price_history))
    )
    return _to_response(result)


@router.get("", response_model=ProductListResponse)
async def list_products(
    session: Annotated[AsyncSession, Depends(get_session)],
    user_id: Annotated[str, Depends(get_current_user_id)],
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
    sort: str = Query(default="created_at_desc"),
):
    total = await session.scalar(select(func.count()).select_from(Product))
    offset = (page - 1) * limit
    stmt = select(Product).options(selectinload(Product.price_history)).offset(offset).limit(limit)
    if sort == "created_at_asc":
        stmt = stmt.order_by(Product.created_at.asc())
    else:
        stmt = stmt.order_by(Product.created_at.desc())

    rows = (await session.scalars(stmt)).all()
    return ProductListResponse(items=[_to_response(p) for p in rows], total=total, page=page, limit=limit)


@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(
    product_id: uuid.UUID,
    session: Annotated[AsyncSession, Depends(get_session)],
    user_id: Annotated[str, Depends(get_current_user_id)],
):
    product = await session.scalar(
        select(Product).where(Product.id == product_id).options(selectinload(Product.price_history))
    )
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return _to_response(product)


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(
    product_id: uuid.UUID,
    session: Annotated[AsyncSession, Depends(get_session)],
    user_id: Annotated[str, Depends(get_current_user_id)],
):
    product = await session.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    await session.delete(product)
    await session.commit()


@router.post("/{product_id}/refresh", response_model=ProductResponse)
async def refresh_product(
    product_id: uuid.UUID,
    session: Annotated[AsyncSession, Depends(get_session)],
    user_id: Annotated[str, Depends(get_current_user_id)],
):
    product = await session.scalar(
        select(Product).where(Product.id == product_id).options(selectinload(Product.price_history))
    )
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    try:
        scraped = await _scraper.scrape(product.url)
    except (TimeoutError, ValueError) as e:
        raise HTTPException(status_code=422, detail=str(e))

    price_entry = PriceHistory(
        product_id=product.id,
        price=scraped.price,
        original_price=scraped.original_price,
        discount_pct=scraped.discount_pct,
        in_stock=scraped.in_stock,
        seller_name=scraped.seller_name,
    )
    session.add(price_entry)
    await session.commit()

    result = await session.scalar(
        select(Product).where(Product.id == product.id).options(selectinload(Product.price_history))
    )
    return _to_response(result)


@router.get("/{product_id}/similar")
async def similar_products(
    product_id: uuid.UUID,
    session: Annotated[AsyncSession, Depends(get_session)],
    user_id: Annotated[str, Depends(get_current_user_id)],
):
    product = await session.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"items": [], "message": "Similarity search coming soon"}
```

- [ ] **Step 5: Testlerin geçtiğini doğrula**

```bash
cd backend && .venv/bin/pytest tests/test_products.py -v
```

Beklenen: `8 passed`

- [ ] **Step 6: Commit**

```bash
git add backend/tests/conftest.py backend/tests/test_products.py backend/app/routers/products.py
git commit -m "feat(backend): implement products router with full TDD"
```

---

## Task 8: App'e Bağla

**Files:**
- Modify: `backend/app/main.py`

- [ ] **Step 1: main.py güncelle**

```python
# backend/app/main.py
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import health, prices
from app.routers import products


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield


app = FastAPI(
    title="PriceWise AI API",
    description="AI-powered price tracking and comparison API",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api", tags=["health"])
app.include_router(prices.router, prefix="/api/prices", tags=["prices"])
app.include_router(products.router, prefix="/api/products", tags=["products"])
```

- [ ] **Step 2: Tüm testleri çalıştır**

```bash
cd backend && .venv/bin/pytest -v
```

Beklenen: tüm testler geçiyor

- [ ] **Step 3: Manuel API testi (Postgres çalışıyor olmalı)**

```bash
cd backend && .venv/bin/uvicorn app.main:app --reload --port 8000
# Yeni terminalde:
curl -X GET http://localhost:8000/api/health
```

Beklenen: `{"status":"ok","service":"pricewise-ai"}`

```bash
curl http://localhost:8000/docs
```

Beklenen: Swagger UI açılmalı (browser'da)

- [ ] **Step 4: Commit**

```bash
git add backend/app/main.py
git commit -m "feat(backend): wire products router and DB lifespan into app"
```

---

## Task 9: Frontend API Client

**Files:**
- Modify: `frontend/src/lib/api.ts`
- Modify: `frontend/src/lib/query-keys.ts`

- [ ] **Step 1: api.ts'e products endpoint'lerini ekle**

Mevcut `api` objesine şunları ekle:

```typescript
// frontend/src/lib/api.ts — api objesi içine ekle
  products: {
    add: (url: string) =>
      apiClient
        .post<ProductResponse>("/api/products", { url })
        .then((r) => r.data),
    list: (params?: { page?: number; limit?: number; sort?: string }) =>
      apiClient
        .get<ProductListResponse>("/api/products", { params })
        .then((r) => r.data),
    get: (id: string) =>
      apiClient.get<ProductResponse>(`/api/products/${id}`).then((r) => r.data),
    remove: (id: string) =>
      apiClient.delete(`/api/products/${id}`).then((r) => r.data),
    refresh: (id: string) =>
      apiClient
        .post<ProductResponse>(`/api/products/${id}/refresh`)
        .then((r) => r.data),
  },
```

Aynı dosyanın tepesine tipleri ekle:

```typescript
// frontend/src/lib/api.ts — dosyanın başına (import'tan sonra)
export interface PriceSnapshot {
  price: string;
  original_price: string | null;
  discount_pct: string | null;
  in_stock: boolean;
  seller_name: string | null;
  scraped_at: string;
}

export interface ProductResponse {
  id: string;
  url: string;
  platform: string;
  name: string;
  brand: string | null;
  category: string | null;
  image_url: string | null;
  created_at: string;
  latest_price: PriceSnapshot | null;
}

export interface ProductListResponse {
  items: ProductResponse[];
  total: number;
  page: number;
  limit: number;
}
```

- [ ] **Step 2: query-keys.ts güncelle**

```typescript
// frontend/src/lib/query-keys.ts
export const queryKeys = {
  health: ["health"] as const,
  prices: {
    all: ["prices"] as const,
    track: (url: string) => ["prices", "track", url] as const,
  },
  products: {
    all: (params?: object) => ["products", params] as const,
    detail: (id: string) => ["products", id] as const,
  },
};
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/lib/api.ts frontend/src/lib/query-keys.ts
git commit -m "feat(frontend): add products API client and query keys"
```

---

## Task 10: Frontend Hooks

**Files:**
- Create: `frontend/src/hooks/use-add-product.ts`
- Modify: `frontend/src/hooks/use-products.ts`
- Create: `frontend/src/hooks/use-refresh-product.ts`
- Create: `frontend/src/hooks/use-delete-product.ts`

- [ ] **Step 1: use-add-product.ts oluştur**

```typescript
// frontend/src/hooks/use-add-product.ts
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";

export function useAddProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (url: string) => api.products.add(url),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}
```

- [ ] **Step 2: use-products.ts güncelle**

```typescript
// frontend/src/hooks/use-products.ts
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";

export function useProducts(params?: { page?: number; limit?: number; sort?: string }) {
  return useQuery({
    queryKey: queryKeys.products.all(params),
    queryFn: () => api.products.list(params),
    staleTime: 30_000,
  });
}

export function useTrackPrice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ url, targetPrice }: { url: string; targetPrice?: number }) =>
      api.prices.track(url, targetPrice),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.prices.all });
    },
  });
}
```

- [ ] **Step 3: use-refresh-product.ts oluştur**

```typescript
// frontend/src/hooks/use-refresh-product.ts
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useRefreshProduct(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.products.refresh(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products", productId] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}
```

- [ ] **Step 4: use-delete-product.ts oluştur**

```typescript
// frontend/src/hooks/use-delete-product.ts
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => api.products.remove(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}
```

- [ ] **Step 5: Commit**

```bash
git add frontend/src/hooks/
git commit -m "feat(frontend): add product hooks (add, list, refresh, delete)"
```

---

## Task 11: Frontend Bileşenler

**Files:**
- Create: `frontend/src/components/UrlInput.tsx`
- Create: `frontend/src/components/ProductCard.tsx`
- Create: `frontend/src/components/ProductList.tsx`

- [ ] **Step 1: UrlInput.tsx oluştur**

```tsx
// frontend/src/components/UrlInput.tsx
"use client";

import { useState } from "react";

interface UrlInputProps {
  onSubmit: (url: string) => void;
  isLoading?: boolean;
}

export function UrlInput({ onSubmit, isLoading = false }: UrlInputProps) {
  const [url, setUrl] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (url.trim()) onSubmit(url.trim());
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 max-w-xl mx-auto">
      <input
        type="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Trendyol veya Hepsiburada URL yapıştır..."
        required
        disabled={isLoading}
        className="flex-1 bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={isLoading || !url.trim()}
        className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors px-6 py-3 rounded-lg font-semibold text-white flex items-center gap-2"
      >
        {isLoading ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Scraping...
          </>
        ) : (
          "Takibe Al"
        )}
      </button>
    </form>
  );
}
```

- [ ] **Step 2: ProductCard.tsx oluştur**

```tsx
// frontend/src/components/ProductCard.tsx
"use client";

import Image from "next/image";
import { ProductResponse } from "@/lib/api";
import { useRefreshProduct } from "@/hooks/use-refresh-product";
import { useDeleteProduct } from "@/hooks/use-delete-product";

interface ProductCardProps {
  product: ProductResponse;
}

const PLATFORM_LABELS: Record<string, { label: string; color: string }> = {
  trendyol: { label: "Trendyol", color: "bg-orange-500/10 text-orange-400 border-orange-500/20" },
  hepsiburada: { label: "Hepsiburada", color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
};

export function ProductCard({ product }: ProductCardProps) {
  const refresh = useRefreshProduct(product.id);
  const remove = useDeleteProduct();
  const badge = PLATFORM_LABELS[product.platform] ?? { label: product.platform, color: "bg-slate-500/10 text-slate-400 border-slate-500/20" };
  const price = product.latest_price;

  return (
    <div className="bg-slate-700/30 border border-slate-700 rounded-xl p-4 flex flex-col gap-3 hover:border-slate-600 transition-colors">
      {product.image_url && (
        <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-white">
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-contain p-2"
            sizes="(max-width: 640px) 100vw, 300px"
          />
        </div>
      )}

      <div className="flex items-start justify-between gap-2">
        <span className={`text-xs px-2 py-0.5 rounded-full border ${badge.color}`}>
          {badge.label}
        </span>
        {price?.discount_pct && (
          <span className="text-xs bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full">
            %{price.discount_pct} indirim
          </span>
        )}
      </div>

      <div>
        <p className="text-white font-medium text-sm line-clamp-2">{product.name}</p>
        {product.brand && <p className="text-slate-400 text-xs mt-0.5">{product.brand}</p>}
      </div>

      {price && (
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold text-white">
            {Number(price.price).toLocaleString("tr-TR")} ₺
          </span>
          {price.original_price && (
            <span className="text-sm text-slate-500 line-through">
              {Number(price.original_price).toLocaleString("tr-TR")} ₺
            </span>
          )}
        </div>
      )}

      <div className="flex gap-2 mt-auto pt-2 border-t border-slate-700">
        <button
          onClick={() => refresh.mutate()}
          disabled={refresh.isPending}
          className="flex-1 text-xs text-slate-400 hover:text-white border border-slate-700 hover:border-slate-500 rounded-lg py-1.5 transition-colors disabled:opacity-50"
        >
          {refresh.isPending ? "Güncelleniyor..." : "Fiyatı Güncelle"}
        </button>
        <button
          onClick={() => remove.mutate(product.id)}
          disabled={remove.isPending}
          className="text-xs text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/40 rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50"
        >
          Sil
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: ProductList.tsx oluştur**

```tsx
// frontend/src/components/ProductList.tsx
"use client";

import { ProductCard } from "@/components/ProductCard";
import { ProductResponse } from "@/lib/api";

interface ProductListProps {
  products: ProductResponse[];
  isLoading?: boolean;
}

export function ProductList({ products, isLoading = false }: ProductListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-slate-700/20 border border-slate-700 rounded-xl h-64 animate-pulse" />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-20 text-slate-400">
        <p className="text-4xl mb-3">📦</p>
        <p className="text-lg font-medium text-white mb-1">Henüz ürün eklenmedi</p>
        <p className="text-sm">Ana sayfadan URL yapıştırarak ürün takibine başla.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/UrlInput.tsx frontend/src/components/ProductCard.tsx frontend/src/components/ProductList.tsx
git commit -m "feat(frontend): add UrlInput, ProductCard, ProductList components"
```

---

## Task 12: Frontend Sayfalar

**Files:**
- Modify: `frontend/src/app/page.tsx`
- Create: `frontend/src/app/dashboard/page.tsx`

- [ ] **Step 1: next.config.ts'e image domain ekle (Trendyol CDN için)**

```typescript
// frontend/next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.dsmcdn.com" },
      { protocol: "https", hostname: "img.hepsiburada.com" },
      { protocol: "https", hostname: "productimages.hepsiburada.net" },
    ],
  },
};

export default nextConfig;
```

- [ ] **Step 2: app/page.tsx güncelle — UrlInput + spinner + success preview**

```tsx
// frontend/src/app/page.tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { UrlInput } from "@/components/UrlInput";
import { ProductCard } from "@/components/ProductCard";
import { useAddProduct } from "@/hooks/use-add-product";
import { ProductResponse } from "@/lib/api";

export default function Home() {
  const addProduct = useAddProduct();
  const [lastAdded, setLastAdded] = useState<ProductResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(url: string) {
    setErrorMsg(null);
    setLastAdded(null);
    try {
      const product = await addProduct.mutateAsync(url);
      setLastAdded(product);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Bir hata oluştu");
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 text-blue-400 text-sm mb-8">
            <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
            AI-Powered Price Tracking
          </div>

          <h1 className="text-5xl font-bold tracking-tight mb-6">
            Track prices smarter with{" "}
            <span className="text-blue-400">PriceWise AI</span>
          </h1>

          <p className="text-xl text-slate-400 mb-12">
            Trendyol veya Hepsiburada URL&apos;si yapıştır, fiyat takibini başlat.
          </p>

          <UrlInput onSubmit={handleSubmit} isLoading={addProduct.isPending} />

          {errorMsg && (
            <p className="mt-4 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2">
              {errorMsg}
            </p>
          )}

          {lastAdded && (
            <div className="mt-8 max-w-xs mx-auto">
              <p className="text-green-400 text-sm mb-3">Ürün eklendi!</p>
              <ProductCard product={lastAdded} />
              <Link
                href="/dashboard"
                className="mt-4 inline-block text-sm text-blue-400 hover:text-blue-300 underline"
              >
                Dashboard&apos;a git →
              </Link>
            </div>
          )}

          <div className="mt-20 grid grid-cols-3 gap-8 text-left">
            {features.map((f) => (
              <div key={f.title} className="bg-slate-700/30 border border-slate-700 rounded-xl p-6">
                <div className="text-2xl mb-3">{f.icon}</div>
                <h3 className="font-semibold mb-2">{f.title}</h3>
                <p className="text-slate-400 text-sm">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

const features = [
  { icon: "📉", title: "Price Drop Alerts", description: "Ürün hedef fiyata düşünce anında bildirim al." },
  { icon: "🤖", title: "AI Predictions", description: "Geçmiş verilerle en iyi alım zamanını tahmin et." },
  { icon: "🔍", title: "Multi-retailer", description: "Trendyol ve Hepsiburada'yı aynı anda takip et." },
];
```

- [ ] **Step 3: app/dashboard/page.tsx oluştur**

```tsx
// frontend/src/app/dashboard/page.tsx
"use client";

import Link from "next/link";
import { useProducts } from "@/hooks/use-products";
import { ProductList } from "@/components/ProductList";

export default function Dashboard() {
  const { data, isLoading, isError } = useProducts();

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-slate-400 mt-1">
              {data ? `${data.total} ürün takip ediliyor` : "Takip edilen ürünler"}
            </p>
          </div>
          <Link
            href="/"
            className="bg-blue-600 hover:bg-blue-500 transition-colors px-4 py-2 rounded-lg text-sm font-semibold"
          >
            + Ürün Ekle
          </Link>
        </div>

        {isError && (
          <p className="text-red-400 text-sm mb-6 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
            Ürünler yüklenirken hata oluştu. Backend çalışıyor mu?
          </p>
        )}

        <ProductList products={data?.items ?? []} isLoading={isLoading} />
      </div>
    </main>
  );
}
```

- [ ] **Step 4: Dev server'ı başlat ve test et**

```bash
# Terminal 1 — backend
cd backend && .venv/bin/uvicorn app.main:app --reload --port 8000

# Terminal 2 — frontend
cd frontend && npm run dev
```

Tarayıcıda kontrol:
1. `http://localhost:3000` — landing page yükleniyor
2. Bir Trendyol URL'si gir → spinner dönüyor → ürün kartı görünüyor
3. `http://localhost:3000/dashboard` → eklenen ürün listeleniyor
4. "Fiyatı Güncelle" butonu çalışıyor
5. "Sil" butonu ile ürün kaldırılıyor

- [ ] **Step 5: Son commit**

```bash
git add frontend/src/app/page.tsx frontend/src/app/dashboard/ frontend/next.config.ts
git commit -m "feat(frontend): add URL input, dashboard page with product grid"
```

---

## Self-Review Notları

**Spec coverage kontrolü:**
- ✅ Trendyol + Hepsiburada URL'si → scrape (Task 6)
- ✅ ≤ 8 saniye → `scraper_timeout_ms = 8000` (Task 1)
- ✅ Geçersiz URL → `422` (Pydantic validator, Task 5)
- ✅ Desteklenmeyen platform → `400` (router, Task 7)
- ✅ Duplicate URL → `200` mevcut ürün (router, Task 7)
- ✅ 5 ürün limiti → `429` (router + config, Task 7)
- ✅ Ürün kartı: isim, fotoğraf, fiyat, indirim (Task 11)
- ✅ Dashboard listesi (Task 12)
- ✅ Manuel refresh (Task 7 + Task 10)
- ✅ `/similar` stub (Task 7)
- ✅ Tüm tablolar migration'da (Task 4)
- ✅ X-User-Id auth stub (Task 1)

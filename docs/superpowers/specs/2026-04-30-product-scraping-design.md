# Product Scraping & Registration — Design Spec

**Date:** 2026-04-30
**Status:** Approved
**Scope:** Web scraping feature — ürün ekleme, listeleme, silme, manuel refresh

---

## 1. Kullanıcı Hikayesi

Kullanıcı Trendyol veya Hepsiburada URL'si girerek ürünü sisteme ekler; isim, fotoğraf, mevcut fiyat ve indirim bilgisiyle birlikte dashboard'unda görür.

---

## 2. Kabul Kriterleri

- Trendyol URL'si girilince ≤ 8 saniyede fiyat dönmeli
- Hepsiburada URL'si de çalışmalı
- Geçersiz veya desteklenmeyen URL'de `400` hata mesajı
- Aynı URL ikinci kez eklenince yeni kayıt oluşmaz, mevcut ürün dönülür (`200`)
- Ücretsiz kullanıcı en fazla 5 ürün ekleyebilir (`429` limit aşımında)

---

## 3. Veritabanı Şeması

Tüm tablolar ilk Alembic migration'da oluşturulur. Bu feature yalnızca `products` ve `price_history` tablolarını kullanır; diğerleri ileriki feature'lar için hazır bekler.

```sql
CREATE TABLE products (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url          TEXT NOT NULL UNIQUE,
  platform     VARCHAR(20) NOT NULL,  -- 'trendyol' | 'hepsiburada'
  name         TEXT NOT NULL,
  brand        TEXT,
  category     TEXT,
  image_url    TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE price_history (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id     UUID REFERENCES products(id) ON DELETE CASCADE,
  price          DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  discount_pct   DECIMAL(5,2),
  in_stock       BOOLEAN DEFAULT TRUE,
  seller_name    TEXT,
  scraped_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_price_history_product ON price_history(product_id, scraped_at DESC);

CREATE TABLE reviews (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id      UUID REFERENCES products(id) ON DELETE CASCADE,
  rating          SMALLINT CHECK (rating BETWEEN 1 AND 5),
  content         TEXT NOT NULL,
  sentiment_label VARCHAR(10),
  sentiment_score DECIMAL(4,3),
  pinecone_id     TEXT,
  verified        BOOLEAN DEFAULT FALSE,
  review_date     DATE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE users (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email             TEXT NOT NULL UNIQUE,
  hashed_password   TEXT NOT NULL,
  plan              VARCHAR(10) DEFAULT 'free',
  queries_used      INTEGER DEFAULT 0,
  queries_limit     INTEGER DEFAULT 5,
  lemon_customer_id TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE analysis_history (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id),
  product_id  UUID REFERENCES products(id),
  query       TEXT NOT NULL,
  result      JSONB,
  tokens_used INTEGER,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 4. API Endpoint'leri

Tüm endpoint'ler JWT gerektirir. Auth tamamlanana kadar `X-User-Id` header stub olarak kullanılır; auth gelince yalnızca FastAPI dependency değişir, endpoint mantığı dokunulmaz.

| Method | Path | Açıklama |
|--------|------|----------|
| `POST` | `/api/products` | URL al → scrape et → kaydet → `201` dön |
| `GET` | `/api/products` | Kullanıcının ürün listesi. Query: `?page&limit&sort` |
| `GET` | `/api/products/{id}` | Ürün detayı + son fiyat |
| `DELETE` | `/api/products/{id}` | Takipten çıkar (CASCADE: price_history da silinir) |
| `POST` | `/api/products/{id}/refresh` | Manuel scrape → yeni price_history kaydı |
| `GET` | `/api/products/{id}/similar` | Bu feature'da stub — boş liste döner |

### POST /api/products Akışı

1. `X-User-Id` header'dan `user_id` al
2. `queries_used < queries_limit` kontrolü → `429` yoksa devam
3. URL platform tespiti: `trendyol.com` veya `hepsiburada.com` → `400` diğerleri
4. `url UNIQUE` kontrolü → zaten varsa mevcut ürünü `200` ile dön
5. Playwright scrape → `ScrapeResult` al
6. `products` INSERT + `price_history` INSERT — tek transaction
7. `queries_used++`
8. `201` dön

### GET /api/products Akışı

- `user_id` filtresi (şimdilik tüm ürünler — auth gelince gerçek filtre)
- Her ürüne `price_history`'den en son kayıt JOIN edilir (mevcut fiyat için)
- Sayfalama: `page` (default 1), `limit` (default 20), `sort` (`created_at_desc` default)

---

## 5. Scraper Servisi

**Dosya:** `app/services/scraper.py`

```python
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
```

`ScraperService` URL'yi alır, `detect_platform()` ile hangi scraper'ın kullanılacağını belirler:

- `TrendyolScraper` — `trendyol.com` URL'leri
- `HepsiburadaScraper` — `hepsiburada.com` URL'leri

Her scraper Playwright ile sayfayı açar, ilgili CSS selector'ları veya JSON-LD bloklarından veriyi çeker, `ScrapeResult` döner.

**Playwright konfigürasyonu:**
- Headless mode, Chromium
- Timeout: 8 saniye
- `--no-sandbox` (Docker için)
- User-agent rotation (basit)

---

## 6. Backend Dosya Yapısı

```
backend/app/
├── core/
│   └── config.py          # FREE_PRODUCT_LIMIT = 5, ayarlar
├── database.py             # SQLAlchemy async engine + session
├── models/
│   ├── product.py          # Product + PriceHistory ORM modelleri
│   ├── user.py             # User ORM modeli
│   ├── review.py           # Review ORM modeli
│   └── analysis.py         # AnalysisHistory ORM modeli
├── schemas/
│   └── product.py          # Pydantic request/response şemaları
├── routers/
│   └── products.py         # Tüm /products endpoint'leri
├── services/
│   └── scraper.py          # ScraperService + TrendyolScraper + HepsiburadaScraper
└── migrations/             # Alembic
    └── versions/
        └── 001_initial.py  # Tüm tablolar
```

---

## 7. Frontend Dosya Yapısı

```
frontend/src/
├── app/
│   ├── page.tsx                  # URL input + spinner + ürün preview kartı
│   └── dashboard/
│       └── page.tsx              # Takip edilen ürünler listesi
├── components/
│   ├── UrlInput.tsx              # URL form bileşeni
│   ├── ProductCard.tsx           # İsim, görsel, fiyat, indirim, platform badge
│   └── ProductList.tsx           # Dashboard'daki ürün grid'i
├── hooks/
│   ├── use-add-product.ts        # POST /products mutation
│   ├── use-products.ts           # GET /products query (güncellenir)
│   ├── use-refresh-product.ts    # POST /products/{id}/refresh mutation
│   └── use-delete-product.ts     # DELETE /products/{id} mutation
└── lib/
    └── api.ts                    # products endpoint'leri eklenir
```

---

## 8. Hata Durumları

| Durum | HTTP | Mesaj |
|-------|------|-------|
| Desteklenmeyen platform | `400` | "Only Trendyol and Hepsiburada URLs are supported" |
| Geçersiz URL formatı | `422` | Pydantic validation hatası |
| Scraping zaman aşımı | `504` | "Product page could not be loaded in time" |
| Ürün bulunamadı (scraper) | `422` | "Could not extract product data from this URL" |
| Limit aşımı | `429` | "Free plan limit reached (5 products)" |
| Ürün bulunamadı (DB) | `404` | "Product not found" |

---

## 9. Kapsam Dışı (Bu Feature)

- Gerçek JWT auth (stub kullanılır)
- `/similar` embedding similarity (stub — boş liste döner)
- Review scraping ve sentiment analizi
- AI agent ve analysis_history kullanımı
- Lemon Squeezy ödeme entegrasyonu
- Fiyat düşme bildirimleri
- Otomatik periyodik scraping (cron)

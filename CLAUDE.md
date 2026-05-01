# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development (both services in parallel)
```bash
make dev          # starts backend (port 8000) + frontend (port 3000) concurrently
make backend      # backend only: uvicorn with --reload
make frontend     # frontend only: next dev
make install      # first-time setup: creates backend .venv and runs npm install
```

### Individual
```bash
# Backend
cd backend && .venv/bin/uvicorn app.main:app --reload --port 8000

# Frontend
cd frontend && npm run dev
cd frontend && npm run build
cd frontend && npm run lint

# Full stack with infrastructure (postgres, redis, mlflow)
docker compose up
docker compose up --watch   # with hot reload via Compose Watch
```

### Backend environment
The backend uses a local venv at `backend/.venv`. Always invoke Python/uvicorn via `.venv/bin/` — there is no activated venv in the shell.

Copy `backend/.env.example` to `backend/.env` and fill in values before running.

## Architecture

### Request flow
```
Browser → Next.js (port 3000)
            └─ TanStack Query hooks (src/hooks/)
                  └─ axios client (src/lib/api.ts)
                        └─ FastAPI (port 8000)
                              ├─ app/routers/   — route handlers
                              ├─ app/services/  — business logic
                              └─ app/schemas/   — Pydantic models
```

### Frontend (`frontend/src/`)
- **App Router** — `app/` contains pages, layouts, API routes, and `providers.tsx` (TanStack Query provider)
- **Data fetching** — all server state goes through TanStack Query v5; query keys are centralized in `lib/query-keys.ts`; the axios instance is configured in `lib/api.ts`
- **Hooks** — `hooks/use-health.ts`, `hooks/use-prices.ts` wrap queries; add new resource hooks here
- **Styling** — Tailwind CSS v4 via `@tailwindcss/postcss`; no `tailwind.config.js` — configuration is in CSS

> **Warning:** This project runs Next.js 16 and React 19, which have breaking changes from older versions. Before writing any Next.js code, check `node_modules/next/dist/docs/` for current APIs. In Next.js 16, use `proxy.ts` instead of `middleware.ts`.

### Backend (`backend/app/`)
- **FastAPI** entry point: `app/main.py` — registers routers, CORS (allows `localhost:3000`)
- **Routers**: `routers/health.py` (mounted at `/api`), `routers/prices.py` (mounted at `/api/prices`)
- **Services**: business logic lives in `app/services/` — keep routers thin
- **Schemas**: Pydantic v2 models in `app/schemas/` — shared request/response types

### Infrastructure
- **PostgreSQL** (port 5432) and **Redis** (port 6379) run via Docker Compose
- **MLflow** tracking server on port 5000 — used for model versioning in later phases
- The `api` Docker service reads from `backend/.env` and overrides `DATABASE_URL`/`REDIS_URL` for container networking

### Planned stack (not yet implemented)
Per `PROJECT.md`, future phases add: LangChain + LangGraph agent, Pinecone vector DB, fine-tuned BERT-TR sentiment model (LoRA/PEFT), Better Auth, Lemon Squeezy payments, AWS EC2/S3 deploy. The current codebase is early MVP (Faz 1 — price tracking).

---

## Roadmap (PROJECT.md özeti)

### MVP 1 — Fiyat Takip ve Tahmin (Faz 1-2, Ay 1-4) ← şu an buradayız
Hedef: Kullanıcı ürün URL'si girer, fiyat geçmişini görür, tahmin alır, alarm kurar.

| # | Özellik | Teknik notlar |
|---|---------|---------------|
| 1 | Ürün arama ve kayıt | Playwright scraper — Trendyol + Hepsiburada; `products` + `price_history` tabloları |
| 2 | Fiyat geçmişi grafiği | Recharts line chart; günlük cron scraping; 30/90/180 gün filtresi |
| 3 | Fiyat tahmin motoru | Scikit-learn LinearRegression → Prophet; MLflow ile versiyonlama; Redis cache (TTL 1h); `/api/prices/forecast` endpoint |
| 4 | Fiyat alarmı (e-posta) | Hedef fiyat < mevcut fiyat olunca Resend ile mail; günde max 1 mail; `alerts` tablosu |

Kabul kriterleri: scrape ≤ 8sn, tahmin API ≤ 2sn, forecast MAE dashboard'da görünür.

---

### MVP 2 — Akıllı Yorum Analizi / RAG (Faz 2-3, Ay 4-7)
Hedef: Kullanıcı yorumlara doğal dilde soru sorar, AI cevap verir; LangGraph agent karar üretir.

| # | Özellik | Teknik notlar |
|---|---------|---------------|
| 1 | Yorum sorgulama (RAG chat) | LangChain RetrievalQA → Pinecone top-5 chunk → Claude; SSE streaming; RAGAS faithfulness ≥ 0.75 |
| 2 | Otomatik yorum özeti | Pros/Cons listesi; 24h cron + Redis cache; ≥10 yorum şartı |
| 3 | Sentiment skoru | Fine-tuned BERT-TR çıkana kadar rule-based fallback; pozitif/negatif/nötr yüzdesi |
| 4 | LangGraph karar agent'ı | Router → Price Analyst → Review RAG → Decision node; SSE stream; ≤15sn yanıt |

RAG pipeline: Playwright yorumları çek → LangChain `RecursiveCharacterTextSplitter` (256 token, overlap 32) → `text-embedding-3-small` → Pinecone upsert.

---

### MVP 3 — SaaS Platform ve Fine-tuned Model (Faz 4-5, Ay 7-12)
Hedef: Auth, ödeme, Türkçe fine-tuned model, rakip karşılaştırma, Business API.

| # | Özellik | Teknik notlar |
|---|---------|---------------|
| 1 | Auth + freemium | Better Auth; Google OAuth; Redis quota (`user:quota:{id}`); free=5 sorgu/ay, pro=100 |
| 2 | Ödeme | Lemon Squeezy (₺199/ay Pro, ₺799/ay Business); webhook → plan aktive |
| 3 | Fine-tuned Türkçe sentiment | `dbmdz/bert-base-turkish-cased` + LoRA (r=16, lora_alpha=32); Hugging Face Hub'a push; F1 ≥ 0.82, inference ≤ 200ms |
| 4 | Rakip fiyat karşılaştırma | Trendyol + Hepsiburada + n11 paralel scrape (asyncio); ≤10sn |
| 5 | Business API | API key (SHA-256 hash); `X-API-Key` header; 1000 req/gün; Swagger otomatik |

Training: AWS EC2 g4dn.xlarge (~$0.52/saat), 3 epoch ≈ 2 saat. Artifacts → S3.

---

## Veritabanı şeması (özet)

```sql
products        — id, url, platform (trendyol|hepsiburada|n11), name, brand, category
price_history   — product_id, price, original_price, discount_pct, in_stock, scraped_at
reviews         — product_id, rating, content, sentiment_label, sentiment_score, pinecone_id
users           — email, plan (free|pro), queries_used, queries_limit, lemon_customer_id
analysis_history— user_id, product_id, query, result (JSONB), tokens_used
alerts          — user_id, product_id, target_price, channel, active
```

Redis key pattern'leri:
- `price:cache:{product_id}` → 1h TTL
- `analysis:{hash}` → 6h TTL
- `user:quota:{user_id}` → ay sonu sıfırla
- `scrape:lock:{url_hash}` → 5dk TTL (duplicate önleme)

## Monetizasyon

| Plan | Fiyat | Limit |
|------|-------|-------|
| Free | ₺0 | 5 analiz/ay |
| Pro | ₺199/ay | 100 analiz/ay + RAG + agent |
| Business | ₺799/ay | Sınırsız + API erişimi |

Ödeme altyapısı: Lemon Squeezy (Stripe Türkiye'de bireysel kullanım kısıtlı; Lemon Squeezy merchant of record — vergiyi o halleder, Türk kartlarını kabul eder).

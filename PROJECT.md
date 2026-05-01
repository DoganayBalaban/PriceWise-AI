# PriceWise AI — Akıllı E-ticaret Analiz ve Karar Asistanı

> **Proje Teknik Dokümantasyonu** · Doğanay · Nisan 2026

| | | | |
|---|---|---|---|
| **Domain** | E-ticaret / Fintech | **Amaç** | SaaS + Portfolio |
| **Yapı** | 5 Faz | **Süre** | 12 Ay |

---

## İçindekiler

1. [Proje Özeti](#1-proje-özeti)
2. [Teknik Mimari](#2-teknik-mimari)
3. [Dosya Yapısı](#3-dosya-yapısı)
4. [Veritabanı Şeması](#4-veritabanı-şeması)
5. [Faz Faz İmplementasyon Planı](#5-faz-faz-i̇mplementasyon-planı)
6. [Başlangıç Kodu (Boilerplate)](#6-başlangıç-kodu-boilerplate)
7. [Monetizasyon Stratejisi](#7-monetizasyon-stratejisi)
8. [MVP Detayları](#8-mvp-detayları)
9. [API Endpoint Listesi](#9-api-endpoint-listesi)

---

## 1. Proje Özeti

PriceWise AI, Türkiye e-ticaret ekosisteminde (Trendyol, Hepsiburada, n11) alışveriş yapan kullanıcılara ve küçük işletmelere akıllı fiyat analizi, yorum özeti ve satın alma kararı desteği sunan bir SaaS platformudur.

### 1.1 Problem

Türkiye'de online alışveriş yapanların %67'si fiyat karşılaştırması yaparken en az 3 farklı sekme açıyor ve ortalama 23 dakika harcıyor. Yorum okuma ve güvenilirlik değerlendirmesi bu sürenin %40'ını oluşturuyor.

### 1.2 Çözüm

| Kullanıcı Ne Sorar? | PriceWise Ne Üretir? |
|---|---|
| Bu ürünü şimdi almalı mıyım? | Fiyat trendi + rakip karşılaştırması + LLM kararı |
| Bu ürün güvenilir mi? | RAG tabanlı yorum analizi + güven skoru |
| Bütçeme uygun alternatif var mı? | Multi-agent öneri pipeline'ı |
| Bu satıcı güvenilir mi? | Fine-tuned sentiment model + geçmiş veriler |

### 1.3 Tech Stack Özeti

| Katman | Teknoloji | Amaç |
|---|---|---|
| Frontend | Next.js 15, TypeScript, TailwindCSS | Kullanıcı arayüzü |
| Backend API | FastAPI (Python), PostgreSQL, Redis | Model serving, caching |
| ML Pipeline | Python, Pandas, Scikit-learn, MLflow | Fiyat tahmin, analiz |
| LLM Layer | LangChain, LangGraph, Anthropic API | RAG + agent sistemi |
| Vector DB | Pinecone | Yorum embedding deposu |
| Fine-tuning | Hugging Face, LoRA/PEFT, BERT-TR | Türkçe sentiment |
| Cloud | AWS EC2, S3, CloudWatch | Production deploy |
| Auth & Pay | Better Auth, Lemon Squeezy | SaaS altyapısı |

---

## 2. Teknik Mimari

### 2.1 Sistem Akışı

```
Kullanıcı URL veya ürün adı girer
  → Scraper fiyat/yorum çeker
  → ML Pipeline analiz eder
  → RAG pipeline yorumları sorgular
  → LangGraph Agent karar üretir
  → UI sonucu gösterir
```

### 2.2 Katmanlı Mimari Detayı

| Katman | Bileşenler | Notlar |
|---|---|---|
| Layer 1 — Presentation | Next.js App Router, Server Actions, ShadcnUI | TypeScript — mevcut stack'in |
| Layer 2 — API Gateway | FastAPI (Python 3.11), Pydantic models, JWT auth | Next.js'den Python'a köprü |
| Layer 3 — Data Ingestion | Playwright scraper, job queue (BullMQ/Celery), PostgreSQL | Fiyat geçmişi, ham yorum |
| Layer 4 — ML Pipeline | Pandas, Scikit-learn, Prophet (zaman serisi), MLflow | Trend analiz, tahmin |
| Layer 5 — LLM / RAG | LangChain, Pinecone, Claude API, LangGraph | Yorum RAG, karar agent'ı |
| Layer 6 — Fine-tune | Hugging Face Trainer, LoRA, BERT-TR-sentiment | Türkçe yorum sınıflandırma |
| Layer 7 — Cloud Infra | AWS EC2 (API), S3 (model artifacts), CloudWatch | Production monitoring |

### 2.3 LangGraph Agent Akışı

```
  Kullanıcı Sorusu
       │
       ▼
  [Router Node]  ──────────────────────────────┐
       │ fiyat sorusu?                          │ öneri sorusu?
       ▼                                        ▼
  [Price Analyst Node]               [Recommendation Node]
  • Scraper tool çağır               • Alternatif ürün ara
  • ML tahmin tool çağır             • Bütçe filtresi uygula
  • Rakip karşılaştır                       │
       │                                    │
       ▼                                    │
  [Review RAG Node]  ◄──────────────────────┘
  • Pinecone'dan yorum chunk'ları al
  • Sentiment skoru ekle
       │
       ▼
  [Decision Node]
  • Tüm tool çıktılarını birleştir
  • Claude API ile final karar üret
  • Güven skoru hesapla
       │
       ▼
  Kullanıcıya Yanıt (JSON → UI)
```

### 2.4 RAG Pipeline Detayı

| Adım | İşlem | Araç |
|---|---|---|
| 1. Veri Toplama | Trendyol/Hepsiburada yorumları scrape | Playwright + PostgreSQL |
| 2. Chunking | Yorum → 256 token chunk, overlap 32 | LangChain TextSplitter |
| 3. Embedding | Her chunk'ı vektöre dönüştür | text-embedding-3-small |
| 4. İndeksleme | Pinecone'a metadata ile yükle | Pinecone upsert batch |
| 5. Retrieval | Kullanıcı sorusu → top-k=5 chunk | Pinecone similarity search |
| 6. Augmentation | Chunk'ları prompt'a ekle | LangChain PromptTemplate |
| 7. Generation | Claude API ile yanıt üret | Anthropic claude-sonnet |

---

## 3. Dosya Yapısı

```
pricewise-ai/
│
├── apps/
│   ├── web/                          # Next.js 15 frontend
│   │   ├── app/
│   │   │   ├── (auth)/
│   │   │   │   ├── login/page.tsx
│   │   │   │   └── register/page.tsx
│   │   │   ├── (dashboard)/
│   │   │   │   ├── analyze/page.tsx  # Ürün analiz sayfası
│   │   │   │   ├── history/page.tsx  # Geçmiş sorgular
│   │   │   │   └── settings/page.tsx
│   │   │   ├── api/
│   │   │   │   ├── analyze/route.ts  # FastAPI proxy
│   │   │   │   └── webhook/route.ts  # Lemon Squeezy
│   │   │   └── layout.tsx
│   │   ├── components/
│   │   │   ├── analysis/
│   │   │   │   ├── PriceChart.tsx
│   │   │   │   ├── ReviewSummary.tsx
│   │   │   │   └── DecisionCard.tsx
│   │   │   └── ui/                   # shadcn components
│   │   └── lib/
│   │       ├── api-client.ts
│   │       └── utils.ts
│   │
│   └── api/                          # FastAPI backend
│       ├── main.py
│       ├── routers/
│       │   ├── analyze.py
│       │   ├── scraper.py
│       │   └── health.py
│       ├── services/
│       │   ├── price_analyzer.py     # ML pipeline
│       │   ├── rag_service.py        # LangChain RAG
│       │   ├── agent_service.py      # LangGraph agent
│       │   └── scraper_service.py    # Playwright
│       ├── models/
│       │   ├── schemas.py            # Pydantic models
│       │   └── db.py                 # SQLAlchemy
│       └── requirements.txt
│
├── ml/                               # ML & training kodu
│   ├── notebooks/
│   │   ├── 01_price_eda.ipynb
│   │   ├── 02_price_forecast.ipynb
│   │   ├── 03_sentiment_finetune.ipynb
│   │   └── 04_rag_eval.ipynb
│   ├── training/
│   │   ├── train_sentiment.py        # LoRA fine-tuning
│   │   └── evaluate_rag.py           # RAGAS evaluation
│   ├── data/
│   │   ├── raw/
│   │   └── processed/
│   └── artifacts/                    # MLflow artifacts
│
├── infra/
│   ├── docker/
│   │   ├── Dockerfile.api
│   │   └── Dockerfile.ml
│   ├── docker-compose.yml
│   └── aws/
│       ├── ec2-setup.sh
│       └── s3-sync.sh
│
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
│
└── README.md
```

---

## 4. Veritabanı Şeması

### 4.1 PostgreSQL Tabloları

#### products

```sql
CREATE TABLE products (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url          TEXT NOT NULL UNIQUE,
  platform     VARCHAR(20) NOT NULL,  -- 'trendyol' | 'hepsiburada' | 'n11'
  name         TEXT NOT NULL,
  brand        TEXT,
  category     TEXT,
  image_url    TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);
```

#### price_history

```sql
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
```

#### reviews

```sql
CREATE TABLE reviews (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id      UUID REFERENCES products(id) ON DELETE CASCADE,
  rating          SMALLINT CHECK (rating BETWEEN 1 AND 5),
  content         TEXT NOT NULL,
  sentiment_label VARCHAR(10),        -- 'positive' | 'negative' | 'neutral'
  sentiment_score DECIMAL(4,3),       -- Fine-tuned model skoru
  pinecone_id     TEXT,               -- Vektör DB referansı
  verified        BOOLEAN DEFAULT FALSE,
  review_date     DATE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

#### users & subscriptions

```sql
CREATE TABLE users (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email             TEXT NOT NULL UNIQUE,
  hashed_password   TEXT NOT NULL,
  plan              VARCHAR(10) DEFAULT 'free',  -- 'free' | 'pro'
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

### 4.2 Redis Key Pattern'leri

| Key Pattern | Value | TTL |
|---|---|---|
| `price:cache:{product_id}` | Son fiyat verisi (JSON) | 1 saat |
| `analysis:{hash}` | Agent analiz sonucu (JSON) | 6 saat |
| `user:quota:{user_id}` | Kalan sorgu hakkı (int) | Ay sonu sıfırla |
| `scrape:lock:{url_hash}` | Duplicate scrape önleme | 5 dakika |

---

## 5. Faz Faz İmplementasyon Planı

### FAZ 1 — Temel Veri ve ML Pipeline · Ay 1-2

- Proje repo kurulumu: monorepo yapısı, Docker Compose (PostgreSQL + Redis)
- Playwright ile Trendyol scraper — ürün adı, fiyat, yıldız, yorum sayısı
- `price_history` tablosuna 30 günlük mock veri üret (pandas ile)
- Pandas EDA: fiyat dağılımı, ortalama, standart sapma, trend görselleştirme
- Scikit-learn: LinearRegression ile 7 günlük fiyat tahmini
- Facebook Prophet ile zaman serisi modeli kur
- MLflow ile model versiyonlaması — ilk experiment kaydet
- FastAPI'ye `/predict` endpoint ekle, modeli serve et
- Next.js'e basit UI: URL gir → fiyat grafiği gör (Recharts)
- GitHub Actions: lint + test CI pipeline

```python
# price_analyzer.py
import pandas as pd
from prophet import Prophet
import mlflow

class PriceAnalyzer:
    def train(self, price_history: pd.DataFrame):
        df = price_history.rename(columns={'scraped_at':'ds','price':'y'})
        model = Prophet(seasonality_mode='multiplicative')
        with mlflow.start_run():
            model.fit(df)
            mlflow.prophet.log_model(model, 'price_prophet')
        return model

    def predict(self, model, days=7):
        future = model.make_future_dataframe(periods=days)
        forecast = model.predict(future)
        return forecast[['ds','yhat','yhat_lower','yhat_upper']].tail(days)
```

---

### FAZ 2 — LLM Uzmanlığı Derinleştirme · Ay 2-4

- Yorum scraper: ürün başına ilk 100 yorumu çek, `reviews` tablosuna kaydet
- LangChain `RecursiveCharacterTextSplitter` ile yorum chunking (256 token)
- `text-embedding-3-small` ile her chunk'ı vektöre dönüştür
- Pinecone index kur: metadata = `{product_id, rating, date, platform}`
- Toplu embedding ve upsert scripti yaz (batch 100)
- LangChain RetrievalQA chain: kullanıcı sorusu → top-5 chunk → Claude yanıt
- FastAPI'ye `/review-qa` endpoint ekle
- RAGAS ile RAG kalitesini ölç: faithfulness + answer relevancy skoru
- UI'a "Yorumlara Sor" bölümü ekle

```python
# rag_service.py
from langchain_anthropic import ChatAnthropic
from langchain_pinecone import PineconeVectorStore
from langchain.chains import RetrievalQA
from langchain_openai import OpenAIEmbeddings

class ReviewRAGService:
    def __init__(self, product_id: str):
        embeddings = OpenAIEmbeddings(model='text-embedding-3-small')
        self.vectorstore = PineconeVectorStore(
            index_name='pricewise-reviews',
            embedding=embeddings,
            namespace=product_id
        )
        self.llm = ChatAnthropic(model='claude-sonnet-4-5')

    def query(self, question: str) -> dict:
        retriever = self.vectorstore.as_retriever(search_kwargs={'k': 5})
        qa_chain = RetrievalQA.from_chain_type(
            llm=self.llm,
            retriever=retriever,
            return_source_documents=True
        )
        result = qa_chain.invoke({'query': question})
        return {
            'answer': result['result'],
            'sources': [doc.page_content[:100] for doc in result['source_documents']]
        }
```

---

### FAZ 3 — LangGraph Agent ve MLOps · Ay 4-7

- LangGraph ile multi-node agent: Router → Price → Review → Decision
- Her node için tool tanımla: `scrape_tool`, `predict_tool`, `rag_tool`, `compare_tool`
- Agent state yönetimi: TypedDict ile node'lar arası veri akışı
- Conditional edge: soruya göre hangi node'a gidileceğini belirle
- MLflow Model Registry: production'a promote edilen modeller buradan servis edilsin
- FastAPI'ye `/agent` endpoint ekle — async streaming response (SSE)
- Next.js'de streaming UI: yanıt harfler halinde gelsin
- Docker Compose'a ML container ekle
- Basit monitoring: CloudWatch veya Grafana ile response time, error rate

```python
# agent_service.py
from langgraph.graph import StateGraph, END
from typing import TypedDict

class AgentState(TypedDict):
    query: str
    product_url: str
    price_analysis: dict
    review_summary: dict
    final_decision: str
    confidence_score: float

def router_node(state: AgentState) -> str:
    if 'fiyat' in state['query'] or 'al' in state['query']:
        return 'price_analyst'
    return 'review_analyst'

graph = StateGraph(AgentState)
graph.add_node('price_analyst', price_analyst_node)
graph.add_node('review_analyst', review_analyst_node)
graph.add_node('decision_maker', decision_node)
graph.add_conditional_edges('router', router_node)
graph.add_edge('price_analyst', 'decision_maker')
graph.add_edge('review_analyst', 'decision_maker')
graph.add_edge('decision_maker', END)
agent = graph.compile()
```

---

### FAZ 4 — Fine-tuning ve Cloud Deploy · Ay 7-10

- Türkçe yorum veri seti hazırla: Trendyol yorumları + manuel label (pos/neg/nötr)
- Hugging Face'ten BERT-TR modeli indir: `dbmdz/bert-base-turkish-cased`
- LoRA konfigürasyonu: r=16, lora_alpha=32, target_modules=[q,v]
- Hugging Face Trainer ile fine-tuning: batch=16, epoch=3, lr=2e-4
- Eval metric: accuracy + F1 (weighted) — RAGAS ile RAG eval
- Model artifact'ı Hugging Face Hub'a push et (public)
- AWS EC2 t3.medium'a FastAPI deploy: uvicorn + gunicorn + nginx
- AWS S3'e MLflow artifact'ları sync et
- W&B (Weights & Biases) ile training metriklerini takip et

```python
# train_sentiment.py
from transformers import AutoTokenizer, AutoModelForSequenceClassification, Trainer
from peft import LoraConfig, get_peft_model, TaskType
import mlflow

MODEL_NAME = 'dbmdz/bert-base-turkish-cased'
tokenizer  = AutoTokenizer.from_pretrained(MODEL_NAME)
base_model = AutoModelForSequenceClassification.from_pretrained(
    MODEL_NAME, num_labels=3  # pos / neg / nötr
)

lora_config = LoraConfig(
    task_type=TaskType.SEQ_CLS,
    r=16,
    lora_alpha=32,
    target_modules=['query', 'value'],
    lora_dropout=0.1,
)
model = get_peft_model(base_model, lora_config)
model.print_trainable_parameters()  # ~1.2% parametre eğitilecek

with mlflow.start_run(run_name='bert-tr-sentiment-lora'):
    trainer = Trainer(model=model, args=training_args, ...)
    trainer.train()
    mlflow.log_metrics({'f1': trainer.evaluate()['eval_f1']})
```

---

### FAZ 5 — SaaS Launch ve Portfolio · Ay 10-12

- Lemon Squeezy entegrasyonu: Pro plan (₺199/ay) — aylık 100 sorgu
- Better Auth ile email + Google OAuth
- Quota middleware: Redis'ten kullanıcı limitini kontrol et
- Landing page: feature listesi, fiyatlandırma, demo video
- Onboarding flow: ilk analiz rehberli yapılsın
- Medium'da teknik yazı serisi: RAG, fine-tuning, LangGraph (3 makale)
- Hugging Face Hub'da model card: `BERT-TR-sentiment-pricewise`
- Product Hunt launch hazırlığı
- Kafein ve diğer şirketlere portfolio link ile başvur

---

## 6. Başlangıç Kodu (Boilerplate)

### 6.1 Docker Compose

```yaml
# docker-compose.yml
version: '3.9'
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: pricewise
      POSTGRES_USER: pw_user
      POSTGRES_PASSWORD: pw_pass
    ports: ['5432:5432']
    volumes: [postgres_data:/var/lib/postgresql/data]

  redis:
    image: redis:7-alpine
    ports: ['6379:6379']

  api:
    build: ./apps/api
    ports: ['8000:8000']
    environment:
      DATABASE_URL: postgresql://pw_user:pw_pass@postgres/pricewise
      REDIS_URL: redis://redis:6379
      ANTHROPIC_API_KEY: ${ANTHROPIC_API_KEY}
      PINECONE_API_KEY: ${PINECONE_API_KEY}
    depends_on: [postgres, redis]

  mlflow:
    image: ghcr.io/mlflow/mlflow:v2.11.0
    ports: ['5000:5000']
    command: mlflow server --host 0.0.0.0
    volumes: [mlflow_data:/mlflow]

volumes:
  postgres_data:
  mlflow_data:
```

### 6.2 FastAPI Entrypoint

```python
# apps/api/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import analyze, scraper, health
import redis.asyncio as redis

app = FastAPI(title='PriceWise AI API', version='0.1.0')

app.add_middleware(
    CORSMiddleware,
    allow_origins=['http://localhost:3000'],
    allow_methods=['*'],
    allow_headers=['*'],
)

app.include_router(health.router,   prefix='/health')
app.include_router(scraper.router,  prefix='/scrape')
app.include_router(analyze.router,  prefix='/analyze')

@app.on_event('startup')
async def startup():
    app.state.redis = await redis.from_url('redis://localhost:6379')
    print('PriceWise API ready')
```

### 6.3 Next.js Analyze Route (Server Action)

```typescript
// apps/web/app/api/analyze/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

export async function POST(req: NextRequest) {
  const session = await getServerSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { url, query } = await req.json()

  const res = await fetch(`${process.env.API_URL}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, query, user_id: session.user.id }),
  })

  // SSE streaming — agent yanıtını client'a ilet
  return new NextResponse(res.body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
    },
  })
}
```

### 6.4 .env Şablonu

```bash
# .env.example

# ── Database ─────────────────────
DATABASE_URL=postgresql://pw_user:pw_pass@localhost:5432/pricewise
REDIS_URL=redis://localhost:6379

# ── AI / LLM ─────────────────────
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...          # embedding için

# ── Vector DB ────────────────────
PINECONE_API_KEY=...
PINECONE_INDEX=pricewise-reviews

# ── Auth ─────────────────────────
BETTER_AUTH_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# ── Payment ──────────────────────
LEMON_SQUEEZY_API_KEY=...
LEMON_SQUEEZY_WEBHOOK_SECRET=...

# ── MLflow ───────────────────────
MLFLOW_TRACKING_URI=http://localhost:5000

# ── AWS ──────────────────────────
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=pricewise-artifacts
```

---

## 7. Monetizasyon Stratejisi

| Plan | Fiyat | Kapsam |
|---|---|---|
| Free | ₺0 / ay | 5 analiz/ay, temel fiyat tahmini |
| Pro | ₺199 / ay (~$9) | 100 analiz/ay, RAG yorum analizi, agent |
| Business | ₺799 / ay (~$35) | Sınırsız, API erişimi, öncelikli destek |

> **Neden Lemon Squeezy?** Stripe Türkiye'de bireysel geliştirici olarak kullanımı kısıtlı. Lemon Squeezy hem merchant of record (vergi halleder) hem de Türk kartlarını kabul eder.

### 7.1 12 Aylık Gelir Hedefi

| Dönem | Hedef Kullanıcı | Gelir (₺) | Odak |
|---|---|---|---|
| Ay 10-11 | Beta: 20 free | ₺0 | Feedback topla |
| Ay 12 | 5 Pro kullanıcı | ~₺1.000 | İlk gelir |
| Ay 15 | 30 Pro, 3 Business | ~₺8.400 | Growth |

---

## 8. MVP Detayları

Her MVP aşaması bağımsız olarak çalışan ve kullanıcıya değer sunan bir ürün dilimi içerir. Bir sonraki MVP'ye geçmeden mevcut aşama production'da olmalıdır.

---

### MVP 1 — Fiyat Takip ve Tahmin · Ay 1-4

#### Özellik 1: Ürün Arama ve Kayıt

**Kullanıcı Hikayesi:** Bir kullanıcı olarak Trendyol/Hepsiburada URL'si girerek ürünü sisteme ekleyebilmek istiyorum, böylece fiyat geçmişini takip edebileyim.

**Ekranlar / Akış:**
- Landing page → URL input kutusu
- Scraping spinner (Playwright çalışıyor)
- Ürün kartı: isim, fotoğraf, mevcut fiyat
- Dashboard: takip edilen ürünler listesi

**Kabul Kriterleri:**
- Trendyol URL'si girilince ≤ 8 saniyede fiyat dönmeli
- Hepsiburada URL'si de çalışmalı
- Geçersiz URL'de hata mesajı göstermeli
- Ücretsiz kullanıcı 5 ürün ekleyebilmeli

> 💡 Scraper için Playwright + stealth plugin kullan. Cloudflare bypass için residential proxy gerekebilir.

---

#### Özellik 2: Fiyat Geçmişi Grafiği

**Kullanıcı Hikayesi:** Bir kullanıcı olarak ürünün son 30 günlük fiyat grafiğini görmek istiyorum, böylece indirim dönemlerini anlayabileyim.

**Ekranlar / Akış:**
- Ürün detay sayfası
- Recharts line chart: tarih × fiyat
- Min / Max / Ortalama fiyat badge'leri
- İndirim yüzdesi timeline'ı

**Kabul Kriterleri:**
- Grafik 30 / 90 / 180 gün filtresi sunmalı
- Fiyat değişim noktaları tooltip ile görünmeli
- Mobil responsive olmalı
- Günlük otomatik scraping çalışmalı (cron)

> 💡 İlk 30 günde gerçek veri az olacak — mock veri üret ve README'de belirt.

---

#### Özellik 3: Fiyat Tahmin Motoru

**Kullanıcı Hikayesi:** Bir kullanıcı olarak "Bu ürünü şimdi almalı mıyım?" sorusuna veri destekli bir cevap almak istiyorum.

**Ekranlar / Akış:**
- Tahmin kartı: "7 gün içinde ~₺X olması bekleniyor"
- Güven aralığı bandı (yhat_lower / yhat_upper)
- Öneri badge'i: 🟢 Al / 🟡 Bekle / 🔴 Fiyat yüksek
- Tahmin metodolojisi açıklaması (tooltip)

**Kabul Kriterleri:**
- Prophet modeli ≥ 30 veri noktasıyla çalışmalı
- MAE skoru ürün sayfasında gösterilmeli (şeffaflık)
- MLflow'da her tahmin versiyonu loglanmalı
- API response ≤ 2 saniye olmalı (Redis cache ile)

> 💡 İlk versiyonda LinearRegression yeterli. Prophet'e Faz 1 sonunda geçilebilir.

---

#### Özellik 4: Fiyat Alarmı (E-posta)

**Kullanıcı Hikayesi:** Bir kullanıcı olarak ürün fiyatı belirlediğim eşiğin altına düşünce e-posta almak istiyorum.

**Ekranlar / Akış:**
- Ürün kartında "Alarm Kur" butonu
- Modal: hedef fiyat input
- E-posta şablonu (Resend veya Nodemailer)
- Alarm yönetimi sayfası

**Kabul Kriterleri:**
- Hedef fiyat altına düşünce ≤ 15 dakika içinde mail gitmeli
- Kullanıcı alarmı devre dışı bırakabilmeli
- Günde max 1 mail gönderilmeli (spam önleme)
- Mail'den direkt ürün sayfasına link

> 💡 Resend (resend.com) ücretsiz 3000 mail/ay — Türkiye'den kullanımı sorunsuz.

---

### MVP 2 — Akıllı Yorum Analizi (RAG) · Ay 4-7

#### Özellik 1: Yorum Sorgulama (RAG Chat)

**Kullanıcı Hikayesi:** Bir kullanıcı olarak "Bu ürünün en sık şikayeti ne?" gibi doğal dil sorularını sorabilmek ve gerçek yorumlara dayanan cevaplar almak istiyorum.

**Ekranlar / Akış:**
- Ürün sayfasında "Yorumlara Sor" bölümü
- Chat input + SSE streaming yanıt
- Kaynak yorumlar: cevabın altında küçük kartlar
- Yorum rating ve tarih bilgisi

**Kabul Kriterleri:**
- Yanıt ≤ 5 saniye içinde akmaya başlamalı
- Her yanıt kaç yorumdan üretildiğini belirtmeli
- Türkçe soru → Türkçe yanıt
- RAGAs faithfulness skoru ≥ 0.75 olmalı

> 💡 Streaming için FastAPI `StreamingResponse` + Next.js `ReadableStream` kullan.

---

#### Özellik 2: Otomatik Yorum Özeti

**Kullanıcı Hikayesi:** Bir kullanıcı olarak ürün sayfasında tüm yorumları okumak yerine AI tarafından üretilen kısa bir özet görmek istiyorum.

**Ekranlar / Akış:**
- Ürün kartında "AI Özeti" bölümü
- Pros / Cons listesi (2-3 madde her biri)
- Genel kullanıcı memnuniyeti skoru (0-100)
- Özet ne zaman üretildi bilgisi

**Kabul Kriterleri:**
- Özet her 24 saatte bir yenilenmeli (cron job)
- En az 10 yorum varsa özet üretilmeli
- Pros/Cons ayrı renkli kartlarda gösterilmeli
- Özet üretme maliyeti loglanmalı (token sayısı)

> 💡 Özeti cache'le: aynı ürün için günde 1 kez Claude çağır, Redis'e yaz.

---

#### Özellik 3: Sentiment Skoru Gösterimi

**Kullanıcı Hikayesi:** Bir kullanıcı olarak ürünün yorumlarının genel duygusunu tek bakışta anlamak istiyorum.

**Ekranlar / Akış:**
- Fiyat grafiğinin yanında sentiment gauge (0-100)
- Pozitif / Negatif / Nötr yorum yüzdeleri
- Zaman içinde sentiment trendi (grafik)
- En çok tekrarlanan anahtar kelimeler (tag cloud)

**Kabul Kriterleri:**
- Fine-tuned BERT-TR modeli sonuçları kullanılmalı (Faz 4'ten önce rule-based fallback)
- Sentiment skoru günlük güncellenmeli
- Yeni yorum gelince anlık güncelleme
- Skor hesaplama metodolojisi açıklanmalı

---

#### Özellik 4: LangGraph Karar Agent'ı

**Kullanıcı Hikayesi:** Bir kullanıcı olarak "Bu ürünü al mı bekle mi?" sorusuna hem fiyat analizini hem yorum özetini birleştiren kapsamlı bir cevap almak istiyorum.

**Ekranlar / Akış:**
- Ürün sayfasında "Karar Al" butonu
- Agent çalışma adımları görünür (tool calls)
- Final karar kartı: Al / Bekle / Alternatif bak
- Güven skoru (%)

**Kabul Kriterleri:**
- Agent ≤ 15 saniyede yanıt vermeli
- Yanıt fiyat tahmini + yorum analizi içermeli
- Neden bu kararı verdi açıklamalı
- Hata durumunda graceful fallback

> 💡 LangGraph node'larını ayrı FastAPI endpoint'lerinden çağır — test kolaylığı için.

---

### MVP 3 — SaaS Platformu ve Fine-tuned Model · Ay 7-12

#### Özellik 1: Auth ve Freemium Sistemi

**Kullanıcı Hikayesi:** Bir kullanıcı olarak Google ile hızlıca kayıt olabilmek ve ücretsiz kotamı takip edebilmek istiyorum.

**Ekranlar / Akış:**
- Landing page: fiyatlandırma bölümü
- Login / Register (Google OAuth + e-posta)
- Dashboard header: "X/5 sorgu kaldı"
- Kota dolunca upgrade modal
- Pro checkout (Lemon Squeezy hosted page)

**Kabul Kriterleri:**
- Google OAuth ≤ 3 tıkla tamamlanmalı
- Free kullanıcı 5 sorgu sonunda 429 almalı
- Pro kullanıcı webhook ile anında aktive olmalı
- Kota ayın 1'inde sıfırlanmalı

> 💡 Better Auth + Lemon Squeezy webhook entegrasyonu. Webhook'u ngrok ile local test et.

---

#### Özellik 2: Fine-tuned Türkçe Sentiment Modeli

**Kullanıcı Hikayesi:** Bir kullanıcı olarak yorum analizinin Türkçe'ye özgü ifadeleri (argo, kısaltma, emoji) doğru anlayan bir modelle yapıldığını bilmek istiyorum.

**Ekranlar / Akış:**
- Sentiment sonuçlarında "BERT-TR ile güçlendirildi" rozeti
- Model card linki (Hugging Face Hub)
- Doğruluk oranı: "X yorum üzerinde %Y doğruluk"

**Kabul Kriterleri:**
- Fine-tuned model F1 ≥ 0.82 olmalı
- Inference ≤ 200ms olmalı (batch processing)
- Model Hugging Face Hub'da public olmalı
- PEFT adapter ağırlıkları S3'te versiyonlanmalı

> 💡 Model training'i AWS EC2 g4dn.xlarge'da çalıştır (~$0.52/saat). 3 epoch için ~2 saat yeterli.

---

#### Özellik 3: Rakip Fiyat Karşılaştırma

**Kullanıcı Hikayesi:** Bir kullanıcı olarak aynı ürünün Trendyol, Hepsiburada ve n11'deki fiyatlarını tek ekranda karşılaştırmak istiyorum.

**Ekranlar / Akış:**
- Ürün sayfasında "Platform Karşılaştırma" tabı
- Platform × Fiyat tablosu (en ucuz yeşil)
- Kargo dahil toplam fiyat hesabı
- Satıcı güven skoru (yorum bazlı)
- Direkt satın al linkleri

**Kabul Kriterleri:**
- 3 platformu paralel scrape et (asyncio)
- Karşılaştırma ≤ 10 saniye tamamlanmalı
- Stokta olmayan platform gri gösterilmeli
- Fiyatlar son güncelleme saati ile gösterilmeli

> 💡 Farklı platformların scraper'ları için ayrı servisler yaz — birinin ban yemesi diğerini etkilemesin.

---

#### Özellik 4: API Erişimi (Business Plan)

**Kullanıcı Hikayesi:** Bir geliştirici olarak PriceWise analizlerini kendi uygulamama entegre etmek için REST API'ye erişmek istiyorum.

**Ekranlar / Akış:**
- Developer portal sayfası
- API key üretme ve yönetimi
- Swagger UI (FastAPI otomatik)
- Rate limit dashboard
- Kullanım istatistikleri

**Kabul Kriterleri:**
- API key Bearer token olarak çalışmalı
- Business plan: 1000 req/gün limiti
- Her endpoint Swagger'da dokümante olmalı
- 429 Too Many Requests düzgün dönmeli

> 💡 API key'leri `users` tablosuna ekle, Redis'te rate limit tut. FastAPI `Depends()` ile middleware yaz.

---

## 9. API Endpoint Listesi

**Base URL:** `https://api.pricewise.ai/v1`  
**Geliştirme:** `http://localhost:8000`

> Auth tipleri: `—` = public, `JWT` = Bearer token, `API-Key` = X-API-Key header, `HMAC` = webhook signature

---

### 🔐 AUTH

| Method | Endpoint | Auth | Açıklama |
|---|---|---|---|
| `POST` | `/auth/register` | — | E-posta + şifre ile kayıt. Returns: user + JWT token. |
| `POST` | `/auth/login` | — | E-posta + şifre ile giriş. Returns: access_token, refresh_token. |
| `POST` | `/auth/refresh` | JWT | Refresh token ile yeni access token al. |
| `POST` | `/auth/logout` | JWT | Refresh token'ı invalidate et. |
| `GET` | `/auth/me` | JWT | Giriş yapan kullanıcının profili ve kota bilgisi. |
| `POST` | `/auth/google` | — | Google OAuth2 code → JWT exchange. |

---

### 📦 PRODUCTS

| Method | Endpoint | Auth | Açıklama |
|---|---|---|---|
| `POST` | `/products` | JWT | URL gönder, ürünü scrape et ve kaydet. Body: `{url: string}`. Returns: product. |
| `GET` | `/products` | JWT | Kullanıcının takip ettiği ürün listesi. Query: `?page&limit&sort`. |
| `GET` | `/products/{id}` | JWT | Ürün detayı: isim, fiyat, platform, kategori, görsel. |
| `DELETE` | `/products/{id}` | JWT | Ürünü takip listesinden kaldır (cascade: alarmlar silinir). |
| `POST` | `/products/{id}/refresh` | JWT | Ürün fiyatını şimdi güncelle (manuel scrape tetikle). |
| `GET` | `/products/{id}/similar` | JWT | Aynı kategoride benzer ürün önerileri (embedding similarity). |

---

### 📈 PRICE HISTORY & FORECAST

| Method | Endpoint | Auth | Açıklama |
|---|---|---|---|
| `GET` | `/prices/{product_id}/history` | JWT | Fiyat geçmişi. Query: `?days=30&platform=trendyol`. |
| `GET` | `/prices/{product_id}/stats` | JWT | Min, max, ortalama, standart sapma, en ucuz gün. |
| `GET` | `/prices/{product_id}/forecast` | JWT | 7/14/30 günlük fiyat tahmini (Prophet). Returns: `[{ds, yhat, lower, upper}]`. |
| `GET` | `/prices/{product_id}/compare` | JWT | Trendyol + Hepsiburada + n11 anlık fiyat karşılaştırması. |
| `GET` | `/prices/{product_id}/decision` | JWT | Al / Bekle / Alternatif önerisi. Kota kullanır. |

---

### 💬 REVIEWS & RAG

| Method | Endpoint | Auth | Açıklama |
|---|---|---|---|
| `GET` | `/reviews/{product_id}` | JWT | Yorumlar listesi. Query: `?rating&sentiment&page&limit`. |
| `GET` | `/reviews/{product_id}/summary` | JWT | AI özeti: pros, cons, genel skor (cache: 24h). |
| `GET` | `/reviews/{product_id}/sentiment` | JWT | Sentiment dağılımı: `{positive, negative, neutral}` yüzdeleri. |
| `POST` | `/reviews/{product_id}/ask` | JWT | RAG soru-cevap. Body: `{question: string}`. Kota kullanır. Streaming: SSE. |
| `POST` | `/reviews/{product_id}/ingest` | API-Key | Admin: yorumları Pinecone'a embed et ve yükle. |

---

### 🤖 AGENT

| Method | Endpoint | Auth | Açıklama |
|---|---|---|---|
| `POST` | `/agent/analyze` | JWT | LangGraph agent: fiyat + yorum + tahmin birleştirip karar üretir. SSE stream. |
| `GET` | `/agent/sessions/{id}` | JWT | Geçmiş agent session'ı getir. Returns: mesajlar + tool call log. |
| `GET` | `/agent/sessions` | JWT | Kullanıcının geçmiş analizleri. Query: `?product_id&page`. |
| `DELETE` | `/agent/sessions/{id}` | JWT | Session geçmişini sil. |

---

### 🔔 ALERTS

| Method | Endpoint | Auth | Açıklama |
|---|---|---|---|
| `POST` | `/alerts` | JWT | Fiyat alarmı oluştur. Body: `{product_id, target_price, channel: 'email'}`. |
| `GET` | `/alerts` | JWT | Kullanıcının alarmları. Query: `?active=true`. |
| `PUT` | `/alerts/{id}` | JWT | Alarm güncelle: target_price, aktif/pasif. |
| `DELETE` | `/alerts/{id}` | JWT | Alarmı sil. |
| `POST` | `/alerts/test/{id}` | JWT | Test mail gönder (alarm doğrulama). |

---

### 💳 SUBSCRIPTION & QUOTA

| Method | Endpoint | Auth | Açıklama |
|---|---|---|---|
| `GET` | `/subscription/plans` | — | Mevcut plan listesi ve fiyatları. |
| `GET` | `/subscription/current` | JWT | Kullanıcının aktif planı, kota kullanımı, yenileme tarihi. |
| `POST` | `/subscription/checkout` | JWT | Lemon Squeezy checkout URL üret. Body: `{plan_id}`. Returns: `{checkout_url}`. |
| `POST` | `/subscription/portal` | JWT | Lemon Squeezy customer portal URL. Plan değişiklik/iptal. |
| `POST` | `/webhooks/lemon-squeezy` | HMAC | Lemon Squeezy webhook: subscription_created / updated / cancelled. |

---

### ⚙️ SCRAPER & ADMIN

| Method | Endpoint | Auth | Açıklama |
|---|---|---|---|
| `POST` | `/scraper/run` | API-Key | Manuel scrape job tetikle. Body: `{product_ids: string[]}`. |
| `GET` | `/scraper/jobs` | API-Key | Aktif ve tamamlanan scrape job'ları. |
| `GET` | `/admin/stats` | API-Key | Platform istatistikleri: toplam kullanıcı, sorgu, gelir. |
| `GET` | `/admin/model/status` | API-Key | MLflow'dan aktif model versiyonu ve metrikleri. |
| `POST` | `/admin/model/promote` | API-Key | MLflow'dan bir model versiyonunu production'a al. |

---

### 🏥 HEALTH & MONITORING

| Method | Endpoint | Auth | Açıklama |
|---|---|---|---|
| `GET` | `/health` | — | Servis sağlık durumu: API, DB, Redis, Pinecone bağlantıları. |
| `GET` | `/health/db` | — | PostgreSQL connection pool durumu. |
| `GET` | `/health/ml` | — | ML model yüklü mü, son inference zamanı. |
| `GET` | `/metrics` | API-Key | Prometheus metrikleri (request count, latency histogram). |

---

### 9.1 Örnek Request / Response Şemaları

#### POST /products — Ürün Kaydet

```http
POST /v1/products
Authorization: Bearer <token>
Content-Type: application/json

{
  "url": "https://www.trendyol.com/urun/example-p-123456789"
}
```

```json
// Response 201
{
  "id": "a1b2c3d4-...",
  "name": "Samsung Galaxy Buds2 Pro",
  "platform": "trendyol",
  "current_price": 2499.00,
  "original_price": 3499.00,
  "discount_pct": 28.6,
  "image_url": "https://cdn.dsmcdn.com/...",
  "in_stock": true,
  "scraped_at": "2026-04-30T10:23:00Z"
}
```

---

#### GET /prices/{id}/forecast — Fiyat Tahmini

```json
// Response 200
{
  "product_id": "a1b2c3d4-...",
  "model": "prophet-v2.1",
  "generated_at": "2026-04-30T10:25:00Z",
  "current_price": 2499.00,
  "forecast": [
    { "date": "2026-05-01", "yhat": 2450.00, "lower": 2310.00, "upper": 2590.00 },
    { "date": "2026-05-07", "yhat": 2380.00, "lower": 2200.00, "upper": 2560.00 }
  ],
  "recommendation": "WAIT",
  "confidence": 0.78,
  "reason": "7 gün içinde ₺120 düşüş bekleniyor."
}
```

---

#### POST /reviews/{id}/ask — RAG Soru-Cevap (SSE)

```http
POST /v1/reviews/a1b2c3d4-/ask
Authorization: Bearer <token>
Content-Type: application/json
Accept: text/event-stream

{ "question": "Ses kalitesi nasıl? Basa doyuyor mu?" }
```

```
data: {"type": "chunk",   "text": "Kullanıcıların büyük çoğunluğu"}
data: {"type": "chunk",   "text": " bas frekanslarından memnun."}
data: {"type": "sources", "reviews": [
  {"id": "rv_001", "rating": 5, "excerpt": "Bas sesi çok dolgun..."},
  {"id": "rv_014", "rating": 4, "excerpt": "ANC açıkken bas biraz..."}
]}
data: {"type": "done", "tokens_used": 412}
data: [DONE]
```

---

#### POST /agent/analyze — LangGraph Agent (SSE)

```http
POST /v1/agent/analyze
Authorization: Bearer <token>

{
  "product_id": "a1b2c3d4-...",
  "question": "Bu kulaklığı şimdi almalı mıyım?"
}
```

```
data: {"type": "thinking",  "node": "router",        "msg": "Soru analiz ediliyor..."}
data: {"type": "thinking",  "node": "price_analyst",  "msg": "Fiyat geçmişi inceleniyor..."}
data: {"type": "tool_call", "tool": "predict_price",  "result": {"yhat": 2380}}
data: {"type": "thinking",  "node": "review_analyst", "msg": "Yorumlar taranıyor..."}
data: {"type": "tool_call", "tool": "rag_query",      "result": {"sentiment": 0.82}}
data: {"type": "chunk",     "text": "Analiz sonucuna göre "}
data: {"type": "chunk",     "text": "1 hafta beklemenizi öneririm."}
data: {"type": "decision",  "verdict": "WAIT", "confidence": 0.81}
data: [DONE]
```

---

### 9.2 HTTP Durum Kodları

| Kod | Kullanım |
|---|---|
| `200 OK` | Başarılı GET / PUT |
| `201 Created` | Başarılı POST (ürün ekleme, alarm oluşturma) |
| `204 No Content` | Başarılı DELETE |
| `400 Bad Request` | Geçersiz body (URL format hatası, eksik alan) |
| `401 Unauthorized` | JWT yok veya süresi dolmuş |
| `403 Forbidden` | Başka kullanıcının kaynağına erişim |
| `404 Not Found` | Ürün / alarm bulunamadı |
| `422 Unprocessable Entity` | Pydantic validation hatası (FastAPI varsayılanı) |
| `429 Too Many Requests` | Kota aşıldı — free plan limiti |
| `500 Internal Server Error` | Scraper / LLM hatası — Sentry'e loglanır |
| `503 Service Unavailable` | Pinecone / Claude API geçici erişim sorunu |

---

> 🛡 **Auth Stratejisi:** JWT access token (15 dk TTL) + refresh token (30 gün, Redis'te). API key'ler SHA-256 hash'lenerek saklanır — rate limit Redis'ten okunur. Tüm endpoint'ler FastAPI'nin `Depends()` sistemiyle korunur.

---

*PriceWise AI — Doğanay · 2026*

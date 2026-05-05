from contextlib import asynccontextmanager

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.redis import close_redis, get_redis
from app.routers import agent, alerts, auth, health, prices, products, reviews
from app.services.alert_service import check_price_alerts
from app.services.review_summary_service import refresh_all_summaries
from app.services.sentiment_service import refresh_all_sentiments


@asynccontextmanager
async def lifespan(app: FastAPI):
    await get_redis()
    scheduler = AsyncIOScheduler()
    scheduler.add_job(check_price_alerts, "interval", minutes=15, id="price_alert_check")
    scheduler.add_job(refresh_all_summaries, "interval", hours=24, id="review_summary_refresh")
    scheduler.add_job(refresh_all_sentiments, "interval", hours=24, id="sentiment_refresh")
    scheduler.start()
    yield
    scheduler.shutdown()
    await close_redis()


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
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(prices.router, prefix="/api/prices", tags=["prices"])
app.include_router(products.router, prefix="/api/products", tags=["products"])
app.include_router(alerts.router, prefix="/api/alerts", tags=["alerts"])
app.include_router(reviews.router, prefix="/api/reviews", tags=["reviews"])
app.include_router(agent.router, prefix="/api/agent", tags=["agent"])

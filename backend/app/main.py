from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import health, prices

app = FastAPI(
    title="PriceWise AI API",
    description="AI-powered price tracking and comparison API",
    version="0.1.0",
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

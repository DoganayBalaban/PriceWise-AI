from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Database
    DATABASE_URL: str = ""
    REDIS_URL: str = ""

    # AI / LLM
    ANTHROPIC_API_KEY: str = ""
    OPENAI_API_KEY: str = ""

    # Vector DB
    PINECONE_API_KEY: str = ""
    PINECONE_INDEX: str = "pricewise-reviews"

    # Auth
    BETTER_AUTH_SECRET: str = ""
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    JWT_ALGORITHM: str = "HS256"

    # Payment
    LEMON_SQUEEZY_API_KEY: str = ""
    LEMON_SQUEEZY_WEBHOOK_SECRET: str = ""
    LEMON_SQUEEZY_STORE_ID: str = ""
    LS_VARIANT_PRO: str = "placeholder_pro_variant_id"
    LS_VARIANT_BUSINESS: str = "placeholder_business_variant_id"

    # MLflow
    MLFLOW_TRACKING_URI: str = "http://localhost:5000"

    # AWS
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    AWS_S3_BUCKET: str = "pricewise-artifacts"

    # Email
    RESEND_API_KEY: str = ""
    RESEND_FROM_EMAIL: str = "PriceWise AI <alerts@pricewise.ai>"

    # App
    APP_URL: str = "http://localhost:3000"
    # Comma-separated extra CORS origins for production (e.g. https://pricewise.vercel.app)
    CORS_ORIGINS: str = ""

    # Scraper
    PLAYWRIGHT_HEADLESS: bool = True

    @property
    def ASYNC_DATABASE_URL(self) -> str:
        # asyncpg uses ?ssl=require; Neon connection strings ship with ?sslmode=require
        url = self.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)
        url = url.replace("sslmode=require", "ssl=require")
        return url

    @property
    def allowed_origins(self) -> list[str]:
        origins = ["http://localhost:3000"]
        for o in self.CORS_ORIGINS.split(","):
            o = o.strip()
            if o:
                origins.append(o)
        return origins


settings = Settings()

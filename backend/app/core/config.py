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

    # Payment
    LEMON_SQUEEZY_API_KEY: str = ""
    LEMON_SQUEEZY_WEBHOOK_SECRET: str = ""

    # MLflow
    MLFLOW_TRACKING_URI: str = "http://localhost:5000"

    # AWS
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    AWS_S3_BUCKET: str = "pricewise-artifacts"

    # Scraper
    PLAYWRIGHT_HEADLESS: bool = True

    @property
    def ASYNC_DATABASE_URL(self) -> str:
        return self.DATABASE_URL.replace(
            "postgresql://", "postgresql+asyncpg://", 1
        )


settings = Settings()

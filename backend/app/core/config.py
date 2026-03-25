from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "ThermoTwin API"
    API_PREFIX: str = "/api"
    DEBUG: bool = False

    # MongoDB
    MONGO_URL: str = "mongodb://root:thermotwin@localhost:27017/?authSource=admin"
    MONGO_DB_NAME: str = "thermotwin"

    # PostgreSQL
    POSTGRES_URL: str = "postgresql+psycopg://thermotwin:thermotwin@localhost:5432/thermotwin"

    # JWT
    JWT_SECRET: str = "change-me-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()

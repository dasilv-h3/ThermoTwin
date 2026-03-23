from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "ThermoTwin API"
    API_PREFIX: str = "/api"
    DEBUG: bool = False

    MONGO_URL: str = "mongodb://root:thermotwin@localhost:27017"
    DATABASE_NAME: str = "thermotwin"

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()

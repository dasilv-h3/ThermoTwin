from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.middleware import RequestLoggingMiddleware
from app.api.routes.auth import router as auth_router
from app.api.routes.health import router as health_router
from app.core.config import settings
from app.core.logging import setup_logging
from app.db.mongodb import close_mongo, connect_mongo
from app.models.user import User

logger = setup_logging(debug=settings.DEBUG)


@asynccontextmanager
async def lifespan(app: FastAPI):
    if not settings.DEBUG and settings.JWT_SECRET == "change-me-in-production":
        raise RuntimeError("JWT_SECRET must be set to a non-default value when DEBUG=False")
    logger.info("Starting %s", settings.APP_NAME)
    await connect_mongo(document_models=[User])
    yield
    await close_mongo()
    logger.info("Shutdown complete")


app = FastAPI(
    title=settings.APP_NAME,
    lifespan=lifespan,
)

app.add_middleware(RequestLoggingMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router, prefix=settings.API_PREFIX)
app.include_router(auth_router, prefix=settings.API_PREFIX)

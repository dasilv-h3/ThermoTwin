from fastapi import APIRouter
from pymongo.errors import ServerSelectionTimeoutError
from sqlalchemy import text

from app.db import mongodb
from app.db.postgresql import async_session

router = APIRouter()


@router.get("/health")
async def health_check():
    # MongoDB
    mongo_status = "disconnected"
    try:
        if mongodb.client:
            await mongodb.client.admin.command("ping")
            mongo_status = "connected"
    except ServerSelectionTimeoutError:
        mongo_status = "unreachable"

    # PostgreSQL
    pg_status = "disconnected"
    try:
        async with async_session() as session:
            await session.execute(text("SELECT 1"))
            pg_status = "connected"
    except Exception:
        pg_status = "unreachable"

    return {
        "status": "ok",
        "mongodb": mongo_status,
        "postgresql": pg_status,
    }

from fastapi import APIRouter
from pymongo.errors import ServerSelectionTimeoutError

from ...db import mongodb

router = APIRouter()


@router.get("/health")
async def health_check():
    mongo_status = "disconnected"
    try:
        if mongodb.client:
            await mongodb.client.admin.command("ping")
            mongo_status = "connected"
    except ServerSelectionTimeoutError:
        mongo_status = "unreachable"

    return {"status": "ok", "mongodb": mongo_status}

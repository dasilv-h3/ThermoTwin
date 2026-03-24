from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import ServerSelectionTimeoutError

from ..core.config import settings

client: AsyncIOMotorClient | None = None


async def connect_mongo(document_models: list | None = None):
    global client
    client = AsyncIOMotorClient(settings.MONGO_URL)
    try:
        await client.admin.command("ping")
        print(f"Connected to MongoDB: {settings.MONGO_DB_NAME}")
    except ServerSelectionTimeoutError:
        print("Warning: Could not connect to MongoDB on startup")
        return

    if document_models:
        await init_beanie(
            database=client[settings.MONGO_DB_NAME],
            document_models=document_models,
        )


async def close_mongo():
    global client
    if client:
        client.close()
        print("MongoDB connection closed")
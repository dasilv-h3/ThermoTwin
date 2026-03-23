from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import ServerSelectionTimeoutError

from ..core.config import settings

client: AsyncIOMotorClient | None = None


def get_database():
    return client[settings.DATABASE_NAME]


async def connect_db():
    global client
    client = AsyncIOMotorClient(settings.MONGO_URL)
    try:
        await client.admin.command("ping")
        print(f"Connected to MongoDB: {settings.DATABASE_NAME}")
    except ServerSelectionTimeoutError:
        print("Warning: Could not connect to MongoDB on startup")


async def close_db():
    global client
    if client:
        client.close()
        print("MongoDB connection closed")

import asyncio
from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from ..core.config import settings

engine = create_async_engine(settings.POSTGRES_URL, echo=settings.DEBUG)
async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def get_session() -> AsyncGenerator[AsyncSession]:
    async with async_session() as session:
        yield session


async def connect_postgres(retries: int = 5, delay: float = 2):
    for attempt in range(1, retries + 1):
        try:
            async with engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)
            print("Connected to PostgreSQL")
            return
        except Exception as e:
            if attempt < retries:
                print(f"PostgreSQL not ready (attempt {attempt}/{retries}), retrying in {delay}s...")
                await asyncio.sleep(delay)
            else:
                print(f"Warning: Could not connect to PostgreSQL after {retries} attempts: {e}")


async def close_postgres():
    await engine.dispose()
    print("PostgreSQL connection closed")
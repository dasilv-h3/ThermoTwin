from datetime import UTC, datetime
from enum import Enum

from beanie import Document
from pydantic import BaseModel, EmailStr, Field
from pymongo import IndexModel


class SubscriptionTier(str, Enum):
    FREE = "free"
    PREMIUM = "premium"
    LIFETIME = "lifetime"


TIER_LIMITS: dict[SubscriptionTier, int] = {
    SubscriptionTier.FREE: 5,
    SubscriptionTier.PREMIUM: 50,
    SubscriptionTier.LIFETIME: 9999,
}


class Subscription(BaseModel):
    tier: SubscriptionTier = SubscriptionTier.FREE
    scans_used: int = 0
    scans_limit: int = TIER_LIMITS[SubscriptionTier.FREE]
    started_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    expires_at: datetime | None = None


class NotificationPreferences(BaseModel):
    energy_tips: bool = True
    scan_ready: bool = True
    promotional: bool = False


class User(Document):
    email: EmailStr
    password_hash: str
    first_name: str
    last_name: str
    subscription: Subscription = Field(default_factory=Subscription)
    notification_preferences: NotificationPreferences = Field(default_factory=NotificationPreferences)
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(UTC))

    class Settings:
        name = "users"
        indexes = [
            IndexModel("email", unique=True),
        ]

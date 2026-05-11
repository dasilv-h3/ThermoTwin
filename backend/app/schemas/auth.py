from datetime import datetime

from pydantic import BaseModel, EmailStr, Field, field_validator

from app.models.user import SubscriptionTier


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    first_name: str = Field(min_length=1, max_length=100)
    last_name: str = Field(min_length=1, max_length=100)

    @field_validator("password")
    @classmethod
    def password_complexity(cls, v: str) -> str:
        if not any(c.isupper() for c in v) or not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one uppercase letter and one digit")
        return v


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshRequest(BaseModel):
    refresh_token: str


class SubscriptionResponse(BaseModel):
    tier: SubscriptionTier
    scans_used: int
    scans_limit: int
    started_at: datetime
    expires_at: datetime | None = None


class NotificationPreferencesResponse(BaseModel):
    energy_tips: bool
    scan_ready: bool
    promotional: bool


class UserResponse(BaseModel):
    id: str
    email: str
    first_name: str
    last_name: str
    subscription: SubscriptionResponse
    notification_preferences: NotificationPreferencesResponse


class UpdateProfileRequest(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    email: EmailStr | None = None


class UpdateNotificationsRequest(BaseModel):
    energy_tips: bool | None = None
    scan_ready: bool | None = None
    promotional: bool | None = None


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

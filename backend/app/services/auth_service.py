from datetime import UTC, datetime

from fastapi import HTTPException, status

from app.core.security import (
    create_access_token,
    create_refresh_token,
    hash_password,
    verify_password,
)
from app.models.user import User
from app.schemas.auth import (
    ChangePasswordRequest,
    RegisterRequest,
    TokenResponse,
    UpdateNotificationsRequest,
    UpdateProfileRequest,
)


async def register_user(data: RegisterRequest) -> TokenResponse:
    existing = await User.find_one({"email": data.email})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )

    user = User(
        email=data.email,
        password_hash=hash_password(data.password),
        first_name=data.first_name,
        last_name=data.last_name,
    )
    await user.insert()

    user_id = str(user.id)
    return TokenResponse(
        access_token=create_access_token(user_id),
        refresh_token=create_refresh_token(user_id),
    )


async def login_user(email: str, password: str) -> TokenResponse:
    user = await User.find_one({"email": email})

    if not user or not verify_password(password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    user_id = str(user.id)
    return TokenResponse(
        access_token=create_access_token(user_id),
        refresh_token=create_refresh_token(user_id),
    )


async def update_profile(user: User, data: UpdateProfileRequest) -> User:
    if data.email and data.email != user.email:
        existing = await User.find_one(User.email == data.email)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already registered",
            )
        user.email = data.email

    if data.first_name is not None:
        user.first_name = data.first_name
    if data.last_name is not None:
        user.last_name = data.last_name

    user.updated_at = datetime.now(UTC)
    await user.save()
    return user


async def update_notifications(user: User, data: UpdateNotificationsRequest) -> User:
    if data.energy_tips is not None:
        user.notification_preferences.energy_tips = data.energy_tips
    if data.scan_ready is not None:
        user.notification_preferences.scan_ready = data.scan_ready
    if data.promotional is not None:
        user.notification_preferences.promotional = data.promotional

    user.updated_at = datetime.now(UTC)
    await user.save()
    return user


async def change_password(user: User, data: ChangePasswordRequest) -> None:
    if not verify_password(data.current_password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Current password is incorrect",
        )

    if len(data.new_password) < 6:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="New password must be at least 6 characters",
        )

    if data.new_password == data.current_password:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="New password must be different from current password",
        )

    user.password_hash = hash_password(data.new_password)
    user.updated_at = datetime.now(UTC)
    await user.save()


async def delete_account(user: User) -> None:
    await user.delete()

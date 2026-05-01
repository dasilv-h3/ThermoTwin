from beanie import PydanticObjectId
from fastapi import APIRouter, Depends, HTTPException, status
from jwt import ExpiredSignatureError, InvalidTokenError

from app.api.deps import get_current_user
from app.core.security import create_access_token, create_refresh_token, decode_token
from app.models.user import User
from app.schemas.auth import (
    ChangePasswordRequest,
    LoginRequest,
    NotificationPreferencesResponse,
    RefreshRequest,
    RegisterRequest,
    SubscriptionResponse,
    TokenResponse,
    UpdateNotificationsRequest,
    UpdateProfileRequest,
    UserResponse,
)
from app.services.auth_service import (
    change_password,
    delete_account,
    login_user,
    register_user,
    update_notifications,
    update_profile,
)

router = APIRouter(prefix="/auth", tags=["Auth"])


def _serialize_user(user: User) -> UserResponse:
    return UserResponse(
        id=str(user.id),
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name,
        subscription=SubscriptionResponse(
            tier=user.subscription.tier,
            scans_used=user.subscription.scans_used,
            scans_limit=user.subscription.scans_limit,
            started_at=user.subscription.started_at,
            expires_at=user.subscription.expires_at,
        ),
        notification_preferences=NotificationPreferencesResponse(
            energy_tips=user.notification_preferences.energy_tips,
            scan_ready=user.notification_preferences.scan_ready,
            promotional=user.notification_preferences.promotional,
        ),
    )


@router.post("/register", response_model=TokenResponse, status_code=201)
async def register(data: RegisterRequest):
    return await register_user(data)


@router.post("/login", response_model=TokenResponse)
async def login(data: LoginRequest):
    return await login_user(data.email, data.password)


@router.post("/refresh", response_model=TokenResponse)
async def refresh(data: RefreshRequest):
    try:
        payload = decode_token(data.refresh_token)
    except ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token has expired",
        )
    except InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )

    if payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type",
        )

    sub = payload.get("sub")
    if not sub:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing token subject",
        )

    try:
        user_id_obj = PydanticObjectId(sub)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token subject",
        )

    user = await User.get(user_id_obj)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User no longer exists",
        )

    user_id = str(user.id)
    return TokenResponse(
        access_token=create_access_token(user_id),
        refresh_token=create_refresh_token(user_id),
    )


@router.get("/me", response_model=UserResponse)
async def me(current_user: User = Depends(get_current_user)):
    return _serialize_user(current_user)


@router.patch("/me", response_model=UserResponse)
async def update_me(
    data: UpdateProfileRequest,
    current_user: User = Depends(get_current_user),
):
    updated = await update_profile(current_user, data)
    return _serialize_user(updated)


@router.patch("/me/notifications", response_model=UserResponse)
async def update_me_notifications(
    data: UpdateNotificationsRequest,
    current_user: User = Depends(get_current_user),
):
    updated = await update_notifications(current_user, data)
    return _serialize_user(updated)


@router.patch("/me/password", status_code=204)
async def update_me_password(
    data: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
):
    await change_password(current_user, data)


@router.delete("/me", status_code=204)
async def delete_me(current_user: User = Depends(get_current_user)):
    await delete_account(current_user)

"""Tests for core security utilities: hashing, JWT creation/decoding."""

import pytest
from datetime import UTC, datetime, timedelta

import jwt as pyjwt

from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.core.config import settings


# ---------------------------------------------------------------------------
# Password hashing
# ---------------------------------------------------------------------------

def test_hash_password_returns_bcrypt_hash():
    hashed = hash_password("MySecret123")
    assert hashed.startswith("$2b$12$")


def test_hash_password_produces_unique_salts():
    h1 = hash_password("same")
    h2 = hash_password("same")
    assert h1 != h2  # different salts


def test_verify_password_correct():
    hashed = hash_password("correct")
    assert verify_password("correct", hashed) is True


def test_verify_password_wrong():
    hashed = hash_password("correct")
    assert verify_password("wrong", hashed) is False


# ---------------------------------------------------------------------------
# JWT access tokens
# ---------------------------------------------------------------------------

def test_create_access_token_decodable():
    token = create_access_token(user_id=42)
    payload = decode_token(token)
    assert payload["sub"] == "42"
    assert payload["type"] == "access"


def test_access_token_expires_in_future():
    token = create_access_token(user_id=1)
    payload = decode_token(token)
    exp = datetime.fromtimestamp(payload["exp"], tz=UTC)
    assert exp > datetime.now(UTC)


# ---------------------------------------------------------------------------
# JWT refresh tokens
# ---------------------------------------------------------------------------

def test_create_refresh_token_decodable():
    token = create_refresh_token(user_id=99)
    payload = decode_token(token)
    assert payload["sub"] == "99"
    assert payload["type"] == "refresh"


def test_refresh_token_longer_expiry_than_access():
    access = create_access_token(user_id=1)
    refresh = create_refresh_token(user_id=1)
    access_exp = decode_token(access)["exp"]
    refresh_exp = decode_token(refresh)["exp"]
    assert refresh_exp > access_exp


# ---------------------------------------------------------------------------
# Token decoding edge cases
# ---------------------------------------------------------------------------

def test_decode_expired_token_raises():
    expired = pyjwt.encode(
        {"sub": "1", "type": "access", "exp": datetime.now(UTC) - timedelta(hours=1)},
        settings.JWT_SECRET,
        algorithm="HS256",
    )
    with pytest.raises(pyjwt.ExpiredSignatureError):
        decode_token(expired)


def test_decode_invalid_signature_raises():
    token = pyjwt.encode(
        {"sub": "1", "type": "access", "exp": datetime.now(UTC) + timedelta(hours=1)},
        "wrong-secret",
        algorithm="HS256",
    )
    with pytest.raises(pyjwt.InvalidSignatureError):
        decode_token(token)


def test_decode_malformed_token_raises():
    with pytest.raises(pyjwt.DecodeError):
        decode_token("not.a.jwt")

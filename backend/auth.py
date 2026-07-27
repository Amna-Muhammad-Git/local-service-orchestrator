"""Password hashing and JWT authentication helpers."""

from __future__ import annotations

import hashlib
import hmac
import os
import secrets
from datetime import datetime, timedelta, timezone

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer


JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_MINUTES = 60
PASSWORD_ITERATIONS = 310_000
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")


def _secret_key() -> str:
    return os.getenv(
        "SECRET_KEY",
        "local-development-secret-change-me-use-a-real-key-in-production",
    )


def hash_password(password: str) -> str:
    """Hash a password with a per-password salt using PBKDF2-HMAC-SHA256."""

    salt = secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac(
        "sha256", password.encode("utf-8"), salt, PASSWORD_ITERATIONS
    )
    return "pbkdf2_sha256${}${}${}".format(
        PASSWORD_ITERATIONS,
        salt.hex(),
        digest.hex(),
    )


def verify_password(password: str, stored_hash: str) -> bool:
    """Verify a password against a hash produced by :func:`hash_password`."""

    try:
        algorithm, iterations, salt_hex, digest_hex = stored_hash.split("$", 3)
        if algorithm != "pbkdf2_sha256":
            return False
        expected = bytes.fromhex(digest_hex)
        actual = hashlib.pbkdf2_hmac(
            "sha256",
            password.encode("utf-8"),
            bytes.fromhex(salt_hex),
            int(iterations),
        )
    except (ValueError, TypeError):
        return False
    return hmac.compare_digest(actual, expected)


def create_access_token(user_id: int) -> str:
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=JWT_EXPIRATION_MINUTES)
    return jwt.encode(
        {"sub": str(user_id), "exp": expires_at},
        _secret_key(),
        algorithm=JWT_ALGORITHM,
    )


async def get_current_user_id(token: str = Depends(oauth2_scheme)) -> int:
    """Decode the bearer token and return its authenticated user ID."""

    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, _secret_key(), algorithms=[JWT_ALGORITHM])
        user_id = int(payload.get("sub", ""))
    except (jwt.InvalidTokenError, ValueError, TypeError):
        raise credentials_error from None

    if user_id <= 0:
        raise credentials_error
    return user_id

"""Registration and login routes."""

from __future__ import annotations

import sqlite3

from fastapi import APIRouter, HTTPException, status

from backend.auth import create_access_token, hash_password, verify_password
from backend.database import get_connection
from backend.schemas import LoginRequest, RegisterRequest, TokenResponse, UserResponse


router = APIRouter(tags=["authentication"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(request: RegisterRequest) -> UserResponse:
    connection = get_connection()
    try:
        cursor = connection.execute(
            """
            INSERT INTO users (name, email, password_hash)
            VALUES (?, ?, ?)
            """,
            (request.name, request.email, hash_password(request.password)),
        )
        connection.commit()
        return UserResponse(
            user_id=cursor.lastrowid,
            name=request.name,
            email=request.email,
        )
    except sqlite3.IntegrityError as error:
        connection.rollback()
        if "users.email" in str(error):
            raise HTTPException(status_code=409, detail="Email is already registered") from error
        raise HTTPException(status_code=400, detail="Could not create user") from error
    finally:
        connection.close()


@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest) -> TokenResponse:
    connection = get_connection()
    try:
        user = connection.execute(
            "SELECT user_id, password_hash FROM users WHERE email = ?",
            (request.email,),
        ).fetchone()
    finally:
        connection.close()

    if user is None or not verify_password(request.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    return TokenResponse(access_token=create_access_token(user["user_id"]))

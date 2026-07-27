"""Request and response models for the API."""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field, field_validator


class RegisterRequest(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    email: str = Field(min_length=3, max_length=255)
    password: str = Field(min_length=8, max_length=128)

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        normalized = value.strip().lower()
        if "@" not in normalized or normalized.startswith("@") or normalized.endswith("@"):
            raise ValueError("A valid email address is required")
        return normalized

    @field_validator("name")
    @classmethod
    def normalize_name(cls, value: str) -> str:
        return value.strip()


class LoginRequest(BaseModel):
    email: str
    password: str

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        return value.strip().lower()


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    user_id: int
    name: str
    email: str


class BookingCreateRequest(BaseModel):
    provider_id: int = Field(gt=0)
    booking_time: datetime


class BookingUpdateRequest(BaseModel):
    status: str

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str) -> str:
        normalized = value.strip().lower()
        allowed = {"pending", "confirmed", "completed", "cancelled"}
        if normalized not in allowed:
            raise ValueError(f"Status must be one of: {', '.join(sorted(allowed))}")
        return normalized


class BookingResponse(BaseModel):
    booking_id: int
    user_id: int
    provider_id: int
    booking_time: datetime
    status: str

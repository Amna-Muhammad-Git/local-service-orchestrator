"""Request and response models for the API."""

from __future__ import annotations

from datetime import date, datetime
from typing import Literal

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
    provider_name: str
    category: str
    neighborhood_zone: str
    booking_time: datetime
    status: str


SERVICE_CATEGORIES = ("plumber", "electrician", "tutor", "carpenter", "painter")
NEIGHBORHOOD_ZONES = ("Gulshan", "Johar", "Clifton", "DHA", "Nazimabad")
BOOKING_STATUSES = ("pending", "confirmed", "completed", "cancelled")


class ServiceRequestCreate(BaseModel):
    message: str = Field(min_length=3, max_length=2000)

    @field_validator("message")
    @classmethod
    def normalize_message(cls, value: str) -> str:
        normalized = value.strip()
        if not normalized:
            raise ValueError("Message cannot be empty")
        return normalized


class ServiceIntent(BaseModel):
    category: Literal["plumber", "electrician", "tutor", "carpenter", "painter"] | None = None
    neighborhood_zone: Literal["Gulshan", "Johar", "Clifton", "DHA", "Nazimabad"] | None = None
    requested_date: date | None = None
    requested_time: str | None = None
    language: Literal["english", "urdu", "roman_urdu", "mixed", "unknown"] = "unknown"

    @field_validator("category", "neighborhood_zone", "requested_date", "requested_time", mode="before")
    @classmethod
    def empty_values_to_none(cls, value: object) -> object:
        return None if value in {"", "unknown", "Unknown"} else value


class ProviderMatch(BaseModel):
    provider_id: int
    name: str
    category: str
    neighborhood_zone: str
    rating: float
    rank: int


class TraceEvent(BaseModel):
    log_id: int
    step: str
    status: str
    details: dict[str, object]
    created_at: datetime


class ServiceRequestResponse(BaseModel):
    request_id: int
    status: Literal["ready", "needs_clarification", "failed", "booked"]
    intent: ServiceIntent
    providers: list[ProviderMatch]
    trace: list[TraceEvent]


class ServiceRequestTraceResponse(BaseModel):
    request_id: int
    input_text: str
    status: str
    intent: ServiceIntent | None = None
    providers: list[ProviderMatch] = Field(default_factory=list)
    trace: list[TraceEvent]


class ServiceRequestBooking(BaseModel):
    provider_id: int = Field(gt=0)
    booking_time: datetime | None = None

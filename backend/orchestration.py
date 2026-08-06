"""Gemini intent extraction and deterministic provider orchestration."""

from __future__ import annotations

import json
import os
from datetime import datetime
from zoneinfo import ZoneInfo

import httpx
from pydantic import ValidationError

from backend.schemas import ServiceIntent


class GeminiConfigurationError(RuntimeError):
    """Raised when the Gemini integration is not configured."""


class GeminiExtractionError(RuntimeError):
    """Raised when Gemini cannot return valid structured intent."""


def _intent_schema() -> dict[str, object]:
    return {
        "type": "object",
        "properties": {
            "category": {
                "type": "string",
                "enum": ["plumber", "electrician", "tutor", "carpenter", "painter", "unknown"],
            },
            "neighborhood_zone": {
                "type": "string",
                "enum": ["Gulshan", "Johar", "Clifton", "DHA", "Nazimabad", "unknown"],
            },
            "requested_date": {
                "type": "string",
                "description": "ISO date such as 2026-08-10, or an empty string if absent",
            },
            "requested_time": {
                "type": "string",
                "description": "24-hour local time such as 10:00, or an empty string if absent",
            },
            "language": {
                "type": "string",
                "enum": ["english", "urdu", "roman_urdu", "mixed", "unknown"],
            },
        },
        "required": [
            "category",
            "neighborhood_zone",
            "requested_date",
            "requested_time",
            "language",
        ],
    }


def _prompt(message: str) -> str:
    today = datetime.now(ZoneInfo("Asia/Karachi")).date().isoformat()
    return f"""
You extract service-request intent for a local services marketplace in Karachi.
Today is {today} in Asia/Karachi. Interpret relative dates such as today,
tomorrow, and kal relative to that date. The user may write in English, Urdu,
Roman Urdu, or a mixture.

Allowed service categories: plumber, electrician, tutor, carpenter, painter.
Allowed neighborhood zones: Gulshan, Johar, Clifton, DHA, Nazimabad.

Return only the requested JSON structure. Use "unknown" for missing category
or zone, and an empty string for missing date or time. Do not invent values
outside the allowed lists.

User request:
{message}
""".strip()


async def extract_intent(message: str) -> ServiceIntent:
    """Call Gemini structured output and validate its response with Pydantic."""

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise GeminiConfigurationError("GEMINI_API_KEY is not configured")

    model = os.getenv("GEMINI_MODEL", "gemini-3.6-flash")
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
    payload = {
        "contents": [{"parts": [{"text": _prompt(message)}]}],
        "generationConfig": {
            "responseMimeType": "application/json",
            "responseSchema": _intent_schema(),
        },
    }

    try:
        async with httpx.AsyncClient(timeout=25.0) as client:
            response = await client.post(
                url,
                headers={"x-goog-api-key": api_key, "Content-Type": "application/json"},
                json=payload,
            )
            response.raise_for_status()
            response_data = response.json()
            text = response_data["candidates"][0]["content"]["parts"][0]["text"]
            return ServiceIntent.model_validate(json.loads(text))
    except (httpx.HTTPError, KeyError, IndexError, TypeError, json.JSONDecodeError) as error:
        raise GeminiExtractionError("Gemini did not return a usable intent") from error
    except ValidationError as error:
        raise GeminiExtractionError("Gemini returned intent outside the allowed schema") from error

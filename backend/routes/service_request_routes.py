"""Authenticated natural-language service orchestration routes."""

from __future__ import annotations

import json
import sqlite3
from datetime import datetime, time

from fastapi import APIRouter, Depends, HTTPException, status

from backend import orchestration
from backend.auth import get_current_user_id
from backend.database import get_connection
from backend.schemas import (
    ProviderMatch,
    ServiceIntent,
    ServiceRequestBooking,
    ServiceRequestCreate,
    ServiceRequestResponse,
    ServiceRequestTraceResponse,
    TraceEvent,
)


router = APIRouter(prefix="/service-requests", tags=["orchestration"])


def _trace_event(row: sqlite3.Row) -> TraceEvent:
    return TraceEvent(
        log_id=row["log_id"],
        step=row["step"],
        status=row["status"],
        details=json.loads(row["details_json"]),
        created_at=datetime.fromisoformat(row["created_at"]),
    )


def _trace(connection: sqlite3.Connection, request_id: int, step: str, state: str, details: dict[str, object]) -> None:
    connection.execute(
        """
        INSERT INTO orchestration_logs (request_id, step, status, details_json)
        VALUES (?, ?, ?, ?)
        """,
        (request_id, step, state, json.dumps(details, default=str)),
    )


def _load_trace(connection: sqlite3.Connection, request_id: int) -> list[TraceEvent]:
    rows = connection.execute(
        """
        SELECT log_id, step, status, details_json, created_at
        FROM orchestration_logs
        WHERE request_id = ?
        ORDER BY log_id
        """,
        (request_id,),
    ).fetchall()
    return [_trace_event(row) for row in rows]


def _load_intent(connection: sqlite3.Connection, request_id: int) -> ServiceIntent:
    row = connection.execute(
        """
        SELECT details_json
        FROM orchestration_logs
        WHERE request_id = ? AND step = 'intent_extracted' AND status = 'completed'
        ORDER BY log_id DESC
        LIMIT 1
        """,
        (request_id,),
    ).fetchone()
    if row is None:
        raise HTTPException(status_code=409, detail="This request has no usable intent")
    return ServiceIntent.model_validate(json.loads(row["details_json"])["intent"])


def _provider_matches(connection: sqlite3.Connection, intent: ServiceIntent) -> list[ProviderMatch]:
    if not intent.category or not intent.neighborhood_zone:
        return []

    rows = connection.execute(
        """
        SELECT provider_id, name, category, neighborhood_zone, rating
        FROM providers
        WHERE category = ? AND neighborhood_zone = ?
        ORDER BY rating DESC, provider_id ASC
        """,
        (intent.category, intent.neighborhood_zone),
    ).fetchall()
    return [
        ProviderMatch(
            provider_id=row["provider_id"],
            name=row["name"],
            category=row["category"],
            neighborhood_zone=row["neighborhood_zone"],
            rating=row["rating"],
            rank=index,
        )
        for index, row in enumerate(rows, start=1)
    ]


def _request_response(
    connection: sqlite3.Connection,
    request_id: int,
    request_status: str,
    intent: ServiceIntent,
    providers: list[ProviderMatch],
) -> ServiceRequestResponse:
    return ServiceRequestResponse(
        request_id=request_id,
        status=request_status,  # type: ignore[arg-type]
        intent=intent,
        providers=providers,
        trace=_load_trace(connection, request_id),
    )


@router.post("", response_model=ServiceRequestResponse, status_code=status.HTTP_200_OK)
async def create_service_request(
    request: ServiceRequestCreate,
    user_id: int = Depends(get_current_user_id),
) -> ServiceRequestResponse:
    connection = get_connection()
    try:
        cursor = connection.execute(
            """
            INSERT INTO orchestration_requests (user_id, input_text, status)
            VALUES (?, ?, 'processing')
            """,
            (user_id, request.message),
        )
        request_id = cursor.lastrowid
        _trace(connection, request_id, "request_received", "completed", {"message_length": len(request.message)})
        connection.commit()

        try:
            intent = await orchestration.extract_intent(request.message)
        except orchestration.GeminiConfigurationError as error:
            _trace(connection, request_id, "intent_extraction", "failed", {"error": str(error)})
            connection.execute(
                "UPDATE orchestration_requests SET status = 'failed' WHERE request_id = ?",
                (request_id,),
            )
            connection.commit()
            raise HTTPException(
                status_code=503,
                detail={"message": "AI intent extraction is not configured", "request_id": request_id},
            ) from error
        except orchestration.GeminiExtractionError as error:
            _trace(connection, request_id, "intent_extraction", "failed", {"error": str(error)})
            connection.execute(
                "UPDATE orchestration_requests SET status = 'failed' WHERE request_id = ?",
                (request_id,),
            )
            connection.commit()
            raise HTTPException(
                status_code=502,
                detail={"message": "AI intent extraction failed", "request_id": request_id},
            ) from error

        _trace(
            connection,
            request_id,
            "intent_extracted",
            "completed",
            {"intent": intent.model_dump(mode="json")},
        )

        if not intent.category or not intent.neighborhood_zone:
            request_status = "needs_clarification"
            _trace(
                connection,
                request_id,
                "clarification_required",
                "completed",
                {"missing": [field for field in ("category", "neighborhood_zone") if not getattr(intent, field)]},
            )
            providers: list[ProviderMatch] = []
        else:
            request_status = "ready"
            _trace(connection, request_id, "providers_filtered", "completed", {
                "category": intent.category,
                "neighborhood_zone": intent.neighborhood_zone,
            })
            providers = _provider_matches(connection, intent)
            _trace(connection, request_id, "providers_ranked", "completed", {
                "provider_count": len(providers),
                "ranking": "rating_desc_then_provider_id_asc",
            })

        connection.execute(
            "UPDATE orchestration_requests SET status = ? WHERE request_id = ?",
            (request_status, request_id),
        )
        connection.commit()
        return _request_response(connection, request_id, request_status, intent, providers)
    except sqlite3.IntegrityError as error:
        connection.rollback()
        raise HTTPException(status_code=400, detail="Could not create service request") from error
    finally:
        connection.close()


@router.get("/{request_id}/trace", response_model=ServiceRequestTraceResponse)
async def get_service_request_trace(
    request_id: int,
    user_id: int = Depends(get_current_user_id),
) -> ServiceRequestResponse:
    connection = get_connection()
    try:
        request_row = connection.execute(
            "SELECT input_text, status FROM orchestration_requests WHERE request_id = ? AND user_id = ?",
            (request_id, user_id),
        ).fetchone()
        if request_row is None:
            raise HTTPException(status_code=404, detail="Service request not found")
        intent_row = connection.execute(
            """
            SELECT details_json
            FROM orchestration_logs
            WHERE request_id = ? AND step = 'intent_extracted' AND status = 'completed'
            ORDER BY log_id DESC
            LIMIT 1
            """,
            (request_id,),
        ).fetchone()
        intent = (
            ServiceIntent.model_validate(json.loads(intent_row["details_json"])["intent"])
            if intent_row
            else None
        )
        return ServiceRequestTraceResponse(
            request_id=request_id,
            input_text=request_row["input_text"],
            status=request_row["status"],
            intent=intent,
            providers=_provider_matches(connection, intent) if intent else [],
            trace=_load_trace(connection, request_id),
        )
    finally:
        connection.close()


@router.post("/{request_id}/book", response_model=dict[str, object], status_code=status.HTTP_201_CREATED)
async def book_recommended_provider(
    request_id: int,
    request: ServiceRequestBooking,
    user_id: int = Depends(get_current_user_id),
) -> dict[str, object]:
    connection = get_connection()
    try:
        request_row = connection.execute(
            "SELECT status FROM orchestration_requests WHERE request_id = ? AND user_id = ?",
            (request_id, user_id),
        ).fetchone()
        if request_row is None:
            raise HTTPException(status_code=404, detail="Service request not found")
        if request_row["status"] not in {"ready", "booked"}:
            raise HTTPException(status_code=409, detail="Service request is not ready for booking")

        intent = _load_intent(connection, request_id)
        if not intent.category or not intent.neighborhood_zone:
            raise HTTPException(status_code=409, detail="Service request needs clarification")

        provider = connection.execute(
            """
            SELECT provider_id, name
            FROM providers
            WHERE provider_id = ? AND category = ? AND neighborhood_zone = ?
            """,
            (request.provider_id, intent.category, intent.neighborhood_zone),
        ).fetchone()
        if provider is None:
            raise HTTPException(status_code=400, detail="Provider is not one of the matched providers")

        booking_time = request.booking_time
        if booking_time is None and intent.requested_date and intent.requested_time:
            try:
                booking_time = datetime.combine(
                    intent.requested_date,
                    time.fromisoformat(intent.requested_time),
                )
            except ValueError as error:
                raise HTTPException(status_code=422, detail="The requested time is invalid") from error
        if booking_time is None:
            raise HTTPException(status_code=422, detail="booking_time is required when the request has no exact time")

        cursor = connection.execute(
            """
            INSERT INTO bookings (user_id, provider_id, booking_time, status)
            VALUES (?, ?, ?, 'pending')
            """,
            (user_id, request.provider_id, booking_time.isoformat(sep=" ")),
        )
        _trace(connection, request_id, "booking_created", "completed", {
            "booking_id": cursor.lastrowid,
            "provider_id": request.provider_id,
        })
        connection.execute(
            "UPDATE orchestration_requests SET status = 'booked' WHERE request_id = ?",
            (request_id,),
        )
        connection.commit()
        return {
            "request_id": request_id,
            "booking_id": cursor.lastrowid,
            "provider_id": provider["provider_id"],
            "provider_name": provider["name"],
            "booking_time": booking_time,
            "status": "pending",
        }
    except sqlite3.IntegrityError as error:
        connection.rollback()
        raise HTTPException(status_code=400, detail="Could not create booking") from error
    finally:
        connection.close()

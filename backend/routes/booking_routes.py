"""Authenticated booking routes with ownership checks."""

from __future__ import annotations

import sqlite3
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status

from backend.auth import get_current_user_id
from backend.database import get_connection
from backend.schemas import BookingCreateRequest, BookingResponse, BookingUpdateRequest


router = APIRouter(prefix="/bookings", tags=["bookings"])


def _booking(row: sqlite3.Row) -> BookingResponse:
    return BookingResponse(
        booking_id=row["booking_id"],
        user_id=row["user_id"],
        provider_id=row["provider_id"],
        provider_name=row["provider_name"],
        category=row["category"],
        neighborhood_zone=row["neighborhood_zone"],
        booking_time=datetime.fromisoformat(row["booking_time"]),
        status=row["status"],
    )


@router.get("", response_model=list[BookingResponse])
async def list_bookings(user_id: int = Depends(get_current_user_id)) -> list[BookingResponse]:
    connection = get_connection()
    try:
        rows = connection.execute(
            """
            SELECT b.booking_id, b.user_id, b.provider_id, p.name AS provider_name,
                   p.category, p.neighborhood_zone, b.booking_time, b.status
            FROM bookings b
            JOIN providers p ON p.provider_id = b.provider_id
            WHERE user_id = ?
            ORDER BY b.booking_time
            """,
            (user_id,),
        ).fetchall()
    finally:
        connection.close()
    return [_booking(row) for row in rows]


@router.post("", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
async def create_booking(
    request: BookingCreateRequest,
    user_id: int = Depends(get_current_user_id),
) -> BookingResponse:
    connection = get_connection()
    try:
        provider = connection.execute(
            "SELECT provider_id FROM providers WHERE provider_id = ?",
            (request.provider_id,),
        ).fetchone()
        if provider is None:
            raise HTTPException(status_code=404, detail="Provider not found")

        cursor = connection.execute(
            """
            INSERT INTO bookings (user_id, provider_id, booking_time, status)
            VALUES (?, ?, ?, 'pending')
            """,
            (user_id, request.provider_id, request.booking_time.isoformat(sep=" ")),
        )
        connection.commit()
        row = connection.execute(
            """
            SELECT b.booking_id, b.user_id, b.provider_id, p.name AS provider_name,
                   p.category, p.neighborhood_zone, b.booking_time, b.status
            FROM bookings b
            JOIN providers p ON p.provider_id = b.provider_id
            WHERE b.booking_id = ?
            """,
            (cursor.lastrowid,),
        ).fetchone()
        return _booking(row)
    except sqlite3.IntegrityError as error:
        connection.rollback()
        raise HTTPException(status_code=400, detail="Could not create booking") from error
    finally:
        connection.close()


@router.patch("/{booking_id}", response_model=BookingResponse)
async def update_booking(
    booking_id: int,
    request: BookingUpdateRequest,
    user_id: int = Depends(get_current_user_id),
) -> BookingResponse:
    connection = get_connection()
    try:
        cursor = connection.execute(
            """
            UPDATE bookings
            SET status = ?
            WHERE booking_id = ? AND user_id = ?
            """,
            (request.status, booking_id, user_id),
        )
        if cursor.rowcount == 0:
            connection.rollback()
            raise HTTPException(status_code=404, detail="Booking not found")
        connection.commit()
        row = connection.execute(
            """
            SELECT b.booking_id, b.user_id, b.provider_id, p.name AS provider_name,
                   p.category, p.neighborhood_zone, b.booking_time, b.status
            FROM bookings b
            JOIN providers p ON p.provider_id = b.provider_id
            WHERE b.booking_id = ? AND b.user_id = ?
            """,
            (booking_id, user_id),
        ).fetchone()
        return _booking(row)
    finally:
        connection.close()


@router.delete("/{booking_id}", response_model=BookingResponse)
async def cancel_booking(
    booking_id: int,
    user_id: int = Depends(get_current_user_id),
) -> BookingResponse:
    connection = get_connection()
    try:
        cursor = connection.execute(
            "UPDATE bookings SET status = 'cancelled' WHERE booking_id = ? AND user_id = ?",
            (booking_id, user_id),
        )
        if cursor.rowcount == 0:
            connection.rollback()
            raise HTTPException(status_code=404, detail="Booking not found")
        connection.commit()
        row = connection.execute(
            """
            SELECT b.booking_id, b.user_id, b.provider_id, p.name AS provider_name,
                   p.category, p.neighborhood_zone, b.booking_time, b.status
            FROM bookings b
            JOIN providers p ON p.provider_id = b.provider_id
            WHERE b.booking_id = ? AND b.user_id = ?
            """,
            (booking_id, user_id),
        ).fetchone()
        return _booking(row)
    finally:
        connection.close()

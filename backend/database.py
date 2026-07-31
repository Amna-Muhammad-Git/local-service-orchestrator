"""SQLite connection helpers for the Phase 2 API."""

from __future__ import annotations

import os
import sqlite3
from pathlib import Path
from typing import Iterator


PROJECT_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_DATABASE_PATH = PROJECT_ROOT / "database" / "khidmat.db"


def database_path() -> Path:
    """Return the configured database path, defaulting to the Phase 1 database."""

    return Path(os.getenv("DATABASE_PATH", str(DEFAULT_DATABASE_PATH))).expanduser()


def get_connection() -> sqlite3.Connection:
    """Open a database connection with row access and foreign keys enabled."""

    connection = sqlite3.connect(database_path())
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    ensure_phase3_tables(connection)
    return connection


def ensure_phase3_tables(connection: sqlite3.Connection) -> None:
    """Create Phase 3 tables when using a database created during Phase 1/2."""

    connection.executescript(
        """
        CREATE TABLE IF NOT EXISTS orchestration_requests (
            request_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            input_text TEXT NOT NULL,
            status TEXT NOT NULL CHECK (
                status IN ('processing', 'ready', 'needs_clarification', 'failed', 'booked')
            ),
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(user_id)
        );

        CREATE TABLE IF NOT EXISTS orchestration_logs (
            log_id INTEGER PRIMARY KEY AUTOINCREMENT,
            request_id INTEGER NOT NULL,
            step TEXT NOT NULL,
            status TEXT NOT NULL CHECK (status IN ('started', 'completed', 'failed')),
            details_json TEXT NOT NULL,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (request_id) REFERENCES orchestration_requests(request_id)
        );

        CREATE INDEX IF NOT EXISTS idx_orchestration_requests_user_id
        ON orchestration_requests(user_id);

        CREATE INDEX IF NOT EXISTS idx_orchestration_logs_request_id
        ON orchestration_logs(request_id);
        """
    )
    connection.commit()


def connection() -> Iterator[sqlite3.Connection]:
    """Yield a connection and always close it after use."""

    database = get_connection()
    try:
        yield database
    finally:
        database.close()

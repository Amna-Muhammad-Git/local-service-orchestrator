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
    return connection


def connection() -> Iterator[sqlite3.Connection]:
    """Yield a connection and always close it after use."""

    database = get_connection()
    try:
        yield database
    finally:
        database.close()

"""Deployment health checks.

Returns sanitized status only — never secrets, connection strings, or
exception text. Used by the public ``GET /health`` probe.
"""

from __future__ import annotations

import logging
from dataclasses import dataclass

from sqlalchemy import text

from app.core.config import settings
from app.db.database import engine

logger = logging.getLogger("evolve.health")


@dataclass(frozen=True)
class HealthSnapshot:
    """Sanitized API + database health snapshot."""

    status: str
    api: str
    database: str
    version: str

    @property
    def is_ok(self) -> bool:
        return self.status == "ok"


def ping_database() -> bool:
    """Return True when PostgreSQL accepts a trivial query."""
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        return True
    except Exception:
        logger.error("Database health check failed")
        return False


def check_system_health() -> HealthSnapshot:
    """Ping PostgreSQL and return a sanitized health snapshot."""
    database = "connected" if ping_database() else "unavailable"
    status = "ok" if database == "connected" else "degraded"
    return HealthSnapshot(
        status=status,
        api="online",
        database=database,
        version=settings.api_version,
    )

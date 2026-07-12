"""Stateless datetime helpers with no domain-specific knowledge.

Centralizing "now" behind :func:`utcnow` gives time-sensitive business rules
(e.g. the ``WorkoutLogService`` edit-window check) a single seam to
monkeypatch in unit tests, instead of each call site invoking
``datetime.now(timezone.utc)`` directly.
"""

from datetime import datetime, timezone


def utcnow() -> datetime:
    """Return the current UTC time as a timezone-aware ``datetime``."""
    return datetime.now(timezone.utc)

"""Stateless datetime helpers with no domain-specific knowledge.

Centralizing "now" behind :func:`utcnow` gives time-sensitive business rules
(e.g. the ``WorkoutLogService`` edit-window check) a single seam to
monkeypatch in unit tests, instead of each call site invoking
``datetime.now(timezone.utc)`` directly.
"""

from datetime import date, datetime, timezone


def utcnow() -> datetime:
    """Return the current UTC time as a timezone-aware ``datetime``."""
    return datetime.now(timezone.utc)


def age_in_years(birth_date: date, as_of: date | None = None) -> int:
    """Return the whole number of years elapsed between ``birth_date`` and ``as_of``.

    ``as_of`` defaults to today (UTC). Handles the "birthday hasn't happened
    yet this year" case correctly (e.g. born 2000-06-15, ``as_of``
    2026-01-01 is age 25, not 26).
    """
    if as_of is None:
        as_of = utcnow().date()
    years = as_of.year - birth_date.year
    had_birthday_this_year = (as_of.month, as_of.day) >= (birth_date.month, birth_date.day)
    if not had_birthday_this_year:
        years -= 1
    return years

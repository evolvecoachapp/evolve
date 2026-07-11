"""Generic pagination helpers shared across list endpoints.

Kept domain-agnostic so any repository/service ("exercises", and future
"programs", "workouts", etc.) can reuse the same envelope and bounds
checking instead of duplicating limit/offset logic per domain.
"""

from dataclasses import dataclass
from typing import Generic, TypeVar

DEFAULT_LIMIT = 20
MAX_LIMIT = 100

T = TypeVar("T")


@dataclass(frozen=True)
class Page(Generic[T]):
    """A single page of results plus enough metadata to page further.

    An internal service-layer DTO, not a Pydantic schema — API routes map
    this to a domain-specific response schema (e.g. an ``ExercisePage``)
    rather than serializing it directly.
    """

    items: list[T]
    total: int
    limit: int
    offset: int


def clamp_pagination(limit: int, offset: int) -> tuple[int, int]:
    """Clamp caller-supplied pagination values to safe bounds.

    Args:
        limit: Requested page size.
        offset: Requested starting position.

    Returns:
        A ``(limit, offset)`` tuple with ``limit`` bounded to
        ``[1, MAX_LIMIT]`` and ``offset`` bounded to ``>= 0``, guaranteeing
        list endpoints can never be queried unbounded (per the reviewer
        checklist: "No unbounded queries — list endpoints are paginated").
    """
    safe_limit = max(1, min(limit, MAX_LIMIT))
    safe_offset = max(0, offset)
    return safe_limit, safe_offset

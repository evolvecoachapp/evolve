"""Stateless text helpers with no domain-specific knowledge."""

import re

_NON_ALNUM_RE = re.compile(r"[^a-z0-9]+")


def slugify(value: str) -> str:
    """Convert a display string into a lowercase, hyphenated slug.

    Used to derive stable identifiers (e.g. ``Exercise.slug``) from a
    human-entered name. Not guaranteed unique on its own — callers that
    need uniqueness (e.g.
    :meth:`~app.services.exercise_service.ExerciseService.create_exercise`)
    must check for collisions and append a numeric suffix themselves.

    Args:
        value: The display string to slugify (e.g. an exercise name).

    Returns:
        A lowercase string containing only ``a-z``, ``0-9``, and single
        hyphens between segments, with no leading/trailing hyphens.
    """
    slug = _NON_ALNUM_RE.sub("-", value.strip().lower()).strip("-")
    return slug or "item"

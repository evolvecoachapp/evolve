"""Structured lookup tables for Progress Analyzer calculations.

The trend/plateau/consistency *coefficients* that operators are likely to
want to tune (minimum data points, plateau window/threshold) are
``Settings`` fields (see ``Settings.progress_*`` in ``app/core/config.py``),
mirroring ``nutrition_constants.py``/``recovery_constants.py``'s split
between environment-configurable scalars and fixed structured tables. This
module holds the one structured table this sprint needs: the deterministic
fallback-narrative templates used when the real LLM call fails.
"""

TREND_DIRECTION_LABELS: dict[str, str] = {
    "increasing": "trending upward",
    "decreasing": "trending downward",
    "stable": "holding steady",
}
"""Human-readable phrasing per :class:`~app.ai.progress_analyzer.TrendDirection`."""


def build_fallback_narrative(
    *,
    trend_direction: str,
    slope_per_week: str,
    consistency_pct: str,
    plateau_detected: bool,
    unit: str,
) -> str:
    """Return a deterministic, templated narrative built from stats alone.

    Used by :class:`~app.ai.progress_analyzer.ProgressAnalyzer` when the
    real LLM call fails — a Progress summary must never surface as an
    unhandled error just because the narrative-generation call failed,
    matching the graceful-degradation precedent set by
    ``app/ai/coach_engines.py``'s adapters.
    """
    direction_phrase = TREND_DIRECTION_LABELS.get(trend_direction, trend_direction)
    parts = [
        f"Your {unit} is {direction_phrase}, changing by about {slope_per_week} {unit} per week.",
        f"You've logged entries in {consistency_pct}% of the weeks in this window.",
    ]
    if plateau_detected:
        parts.append(
            "Your recent values have plateaued — consider adjusting your "
            "training, nutrition, or recovery approach if this isn't your goal."
        )
    parts.append(
        "(Note: this summary is a general estimate; the AI narrative service "
        "is temporarily unavailable.)"
    )
    return " ".join(parts)

"""Structured lookup tables for Recovery Engine calculations.

These are fixed reference tables (standard weekly training-load reference
values and the readiness-level score bands/templated guidance), not
ops-tunable scalars — that distinction is why they live here as named
Python constants rather than as ``Settings`` fields (see
``Settings.recovery_*`` in ``app/core/config.py`` for the scalar
coefficients that *are* environment-configurable), mirroring
``nutrition_constants.py``'s precedent.
"""

TRAINING_LOAD_REFERENCE_SESSIONS_PER_WEEK: float = 5.0
"""A typical well-recovered training frequency; used to normalize session count."""

TRAINING_LOAD_REFERENCE_MINUTES_PER_WEEK: float = 300.0
"""A typical well-recovered weekly training duration; used to normalize total duration."""

TRAINING_LOAD_REFERENCE_RPE: float = 7.0
"""An average RPE at/above which recent training is considered maximally taxing.

When no RPE has been logged for any set in the window, the training-load
calculation falls back to a neutral 0.5 intensity ratio (see
:meth:`~app.ai.recovery_engine.RecoveryEngine._training_load_score`) rather
than assuming either "no load" or "maximal load".
"""

READINESS_LEVEL_LOW_MAX: float = 40.0
"""Composite readiness scores at or below this value are classified LOW."""

READINESS_LEVEL_MODERATE_MAX: float = 70.0
"""Composite readiness scores at or below this value (and above the LOW
threshold) are classified MODERATE; above it, HIGH."""

_DISCLAIMER = (
    "This is a general estimate for training-planning purposes only, not "
    "medical advice — always listen to your body and consult a professional "
    "for persistent pain, illness, or injury."
)

READINESS_GUIDANCE: dict[str, dict[str, object]] = {
    "low": {
        "recommendation_text": (
            "Your readiness is low today — prioritize recovery over intensity. "
            f"{_DISCLAIMER}"
        ),
        "protocols": [
            "Prioritize 7-9 hours of sleep tonight.",
            "Consider a full rest day or light active recovery (walking, easy mobility work).",
            "If you choose to train, reduce planned volume and intensity significantly.",
        ],
    },
    "moderate": {
        "recommendation_text": (
            "Your readiness is moderate — train, but stay attentive to how you feel. "
            f"{_DISCLAIMER}"
        ),
        "protocols": [
            "Consider trimming volume or intensity by 10-20% if soreness or fatigue feels high.",
            "Prioritize a thorough warm-up before your session.",
            "Monitor how early sets feel and adjust load accordingly.",
        ],
    },
    "high": {
        "recommendation_text": (
            "Your readiness is high — a good day to proceed with your planned training. "
            f"{_DISCLAIMER}"
        ),
        "protocols": [
            "Proceed with your planned session as programmed.",
            "Still prioritize post-workout recovery (nutrition, hydration, sleep).",
        ],
    },
}
"""Templated recommendation/protocol text per :class:`~app.ai.recovery_engine.ReadinessLevel`.

Deterministic and rule-based — no LLM call — matching Decision 010's
precedent for the Nutrition Engine's ``summary_text``.
"""

"""Structured lookup tables for Nutrition Engine calculations.

These are fixed reference tables (standard activity-multiplier ranges,
per-goal protein targets, and BMR sex offsets), not ops-tunable scalars —
that distinction is why they live here as named Python constants rather
than as ``Settings`` fields (see ``Settings.nutrition_*`` in
``app/core/config.py`` for the scalar coefficients that *are*
environment-configurable).
"""

from app.models.user import ActivityLevel, Gender, Goal

ACTIVITY_MULTIPLIERS: dict[ActivityLevel, float] = {
    ActivityLevel.SEDENTARY: 1.2,
    ActivityLevel.LIGHTLY_ACTIVE: 1.375,
    ActivityLevel.MODERATELY_ACTIVE: 1.55,
    ActivityLevel.VERY_ACTIVE: 1.725,
    ActivityLevel.EXTREMELY_ACTIVE: 1.9,
}
"""TDEE = BMR * ACTIVITY_MULTIPLIERS[activity_level]. Standard 1.2-1.9 range."""

PROTEIN_G_PER_KG_BY_GOAL: dict[Goal, float] = {
    Goal.LOSE_WEIGHT: 2.2,
    Goal.MAINTAIN_WEIGHT: 1.8,
    Goal.GAIN_MUSCLE: 2.2,
    Goal.IMPROVE_ENDURANCE: 1.6,
    Goal.GENERAL_FITNESS: 1.8,
}
"""Protein target (g) = PROTEIN_G_PER_KG_BY_GOAL[goal] * weight_kg."""

BMR_SEX_OFFSET: dict[Gender, float] = {
    Gender.MALE: 5.0,
    Gender.FEMALE: -161.0,
    # Mifflin-St Jeor has no third term; OTHER/PREFER_NOT_TO_SAY use the
    # midpoint of the male/female offsets rather than picking either one.
    Gender.OTHER: -78.0,
    Gender.PREFER_NOT_TO_SAY: -78.0,
}
"""Used only by :class:`~app.ai.bmr_strategies.MifflinStJeorBMRStrategy`."""

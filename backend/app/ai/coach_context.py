"""Structured, bounded athlete context for Coach LLM synthesis.

``CoachContext`` is an internal AI-layer projection — never an HTTP schema
and never a persistence model. :class:`CoachContextAssembler` reads existing
domain services (never repositories) and degrades per-section when a slice
is missing, so one incomplete domain cannot fail a chat turn.

Identifiers, credentials, and account flags are deliberately omitted.
"""

from __future__ import annotations

import uuid
from datetime import date
from decimal import Decimal
from typing import Any

from pydantic import BaseModel, Field

from app.models.goal import GoalStatus
from app.services.goal_service import GoalService
from app.services.nutrition_service import IncompleteNutritionProfileError, NutritionService
from app.services.progress_service import ProgressService
from app.services.recovery_service import CheckInNotFoundError, RecoveryService
from app.services.user_service import UserNotFoundError, UserService
from app.services.workout_log_service import WorkoutLogService
from app.services.workout_resolution_service import WorkoutResolutionService
from app.utils.datetime import age_in_years, utcnow

MAX_ACTIVE_GOALS = 5
MAX_RECENT_SESSIONS = 5
MAX_PROGRESS_ENTRIES = 8
MAX_TODAY_MEALS = 20
MAX_TODAY_EXERCISES = 20
MAX_SETS_PER_EXERCISE = 12

_UNAVAILABLE = "unavailable"
_INCOMPLETE_PROFILE = "incomplete_profile"
_MISSING_CHECKIN = "missing_checkin"


def _stringify(value: Any) -> str | None:
    """Render a scalar for JSON-safe context, or ``None`` when absent."""
    if value is None:
        return None
    if isinstance(value, Decimal):
        return format(value, "f")
    return str(value)


def _enum_value(value: Any) -> str | None:
    """Return an enum's ``value`` (or ``str``) without leaking the enum type name."""
    if value is None:
        return None
    return str(getattr(value, "value", value))


class CoachProfileContext(BaseModel):
    """Non-identifying fitness profile fields the Coach may speak from."""

    display_name: str | None = None
    age_years: int | None = None
    gender: str | None = None
    height_cm: str | None = None
    current_weight_kg: str | None = None
    target_weight_kg: str | None = None
    activity_level: str | None = None
    primary_goal: str | None = None


class CoachGoalSnapshot(BaseModel):
    """One active user-defined goal, without database identifiers."""

    goal_type: str
    description: str
    status: str
    priority: str
    target_metric_type: str | None = None
    target_value: str | None = None
    target_unit: str | None = None
    target_date: date | None = None


class CoachExerciseSnapshot(BaseModel):
    """A prescribed exercise line item on today's workout template."""

    name: str
    target_sets: int | None = None
    target_reps_min: int | None = None
    target_reps_max: int | None = None
    rest_seconds: int | None = None


class CoachPerformedSetSnapshot(BaseModel):
    """One performed set from a logged session, without set/log identifiers."""

    set_number: int
    weight_kg: str | None = None
    reps: int | None = None
    rpe: str | None = None
    duration_seconds: int | None = None
    is_warmup: bool = False


class CoachPerformedExerciseSnapshot(BaseModel):
    """One exercise actually logged in a session, with performed sets."""

    name: str
    skipped: bool = False
    sets: list[CoachPerformedSetSnapshot] = Field(default_factory=list)


class CoachSessionSnapshot(BaseModel):
    """A recent logged session, without log/workout UUIDs."""

    session_date: date | None = None
    status: str
    duration_minutes: int | None = None
    workout_name: str | None = None
    exercises: list[CoachPerformedExerciseSnapshot] = Field(default_factory=list)


class CoachTrainingContext(BaseModel):
    """Resolved program position plus a short recent-session window."""

    available: bool = True
    reason: str | None = None
    state: str | None = None
    program_name: str | None = None
    current_week: int | None = None
    current_day: int | None = None
    today_workout_name: str | None = None
    today_log_status: str | None = None
    today_exercises: list[CoachExerciseSnapshot] = Field(default_factory=list)
    recent_sessions: list[CoachSessionSnapshot] = Field(default_factory=list)


class CoachMealSnapshot(BaseModel):
    """One logged meal from today, without meal/user identifiers."""

    name: str
    meal_type: str
    calories: str
    protein_g: str
    carbs_g: str
    fat_g: str


class CoachNutritionSection(BaseModel):
    """Today's nutrition targets/adherence, or an unavailable marker."""

    available: bool
    reason: str | None = None
    for_date: date | None = None
    targets: dict[str, str] | None = None
    actual: dict[str, str] | None = None
    adherence: dict[str, str] | None = None
    meals: list[CoachMealSnapshot] = Field(default_factory=list)


class CoachRecoverySection(BaseModel):
    """Today's readiness/check-in, or an unavailable marker."""

    available: bool
    reason: str | None = None
    for_date: date | None = None
    readiness_score: str | None = None
    readiness_level: str | None = None
    sleep_hours: str | None = None
    sleep_quality: int | None = None
    soreness: int | None = None
    fatigue: int | None = None
    protocols: list[str] = Field(default_factory=list)


class CoachProgressSnapshot(BaseModel):
    """One recent progress point, without entry/user/goal/exercise ids."""

    metric_type: str
    value: str
    unit: str
    recorded_date: date


class CoachContext(BaseModel):
    """Bounded athlete brief assembled for one Coach turn.

    JSON-serializable via ``model_dump(mode="json")``. Contains no email,
    password, user UUID, tokens, or account-privilege flags.
    """

    as_of: date
    profile: CoachProfileContext = Field(default_factory=CoachProfileContext)
    goals: list[CoachGoalSnapshot] = Field(default_factory=list)
    training: CoachTrainingContext = Field(default_factory=CoachTrainingContext)
    nutrition: CoachNutritionSection = Field(
        default_factory=lambda: CoachNutritionSection(available=False, reason=_UNAVAILABLE)
    )
    recovery: CoachRecoverySection = Field(
        default_factory=lambda: CoachRecoverySection(available=False, reason=_UNAVAILABLE)
    )
    progress: list[CoachProgressSnapshot] = Field(default_factory=list)


def empty_coach_context(*, as_of: date | None = None) -> CoachContext:
    """Return a structurally valid empty context used when assembly is skipped or fails."""
    return CoachContext(as_of=as_of if as_of is not None else utcnow().date())


class CoachContextAssembler:
    """Assemble a :class:`CoachContext` from existing domain services.

    Each section is isolated: a missing profile field, check-in, or program
    must not raise out of :meth:`assemble`. Caps are enforced both via
    service ``limit`` arguments and a defensive slice.
    """

    def __init__(
        self,
        user_service: UserService,
        goal_service: GoalService,
        workout_resolution_service: WorkoutResolutionService,
        workout_log_service: WorkoutLogService,
        nutrition_service: NutritionService,
        recovery_service: RecoveryService,
        progress_service: ProgressService,
    ) -> None:
        self._user_service = user_service
        self._goal_service = goal_service
        self._workout_resolution_service = workout_resolution_service
        self._workout_log_service = workout_log_service
        self._nutrition_service = nutrition_service
        self._recovery_service = recovery_service
        self._progress_service = progress_service

    def assemble(self, user_id: uuid.UUID, *, as_of: date | None = None) -> CoachContext:
        """Build a bounded context for ``user_id``. Never raises to the caller."""
        resolved_date = as_of if as_of is not None else utcnow().date()
        try:
            return CoachContext(
                as_of=resolved_date,
                profile=self._profile(user_id, resolved_date),
                goals=self._goals(user_id),
                training=self._training(user_id),
                nutrition=self._nutrition(user_id, resolved_date),
                recovery=self._recovery(user_id, resolved_date),
                progress=self._progress(user_id),
            )
        except Exception:
            return empty_coach_context(as_of=resolved_date)

    def _profile(self, user_id: uuid.UUID, as_of: date) -> CoachProfileContext:
        try:
            user = self._user_service.get_user(user_id)
        except (UserNotFoundError, Exception):
            return CoachProfileContext()
        age = None
        try:
            if user.birth_date is not None:
                age = age_in_years(user.birth_date, as_of=as_of)
        except Exception:
            age = None
        display_name = user.first_name.strip() if user.first_name else None
        return CoachProfileContext(
            display_name=display_name or None,
            age_years=age,
            gender=_enum_value(user.gender),
            height_cm=_stringify(user.height_cm),
            current_weight_kg=_stringify(user.current_weight_kg),
            target_weight_kg=_stringify(user.target_weight_kg),
            activity_level=_enum_value(user.activity_level),
            primary_goal=_enum_value(user.goal),
        )

    def _goals(self, user_id: uuid.UUID) -> list[CoachGoalSnapshot]:
        try:
            page = self._goal_service.list_goals(
                user_id, status=GoalStatus.ACTIVE, limit=MAX_ACTIVE_GOALS, offset=0
            )
        except Exception:
            return []
        snapshots: list[CoachGoalSnapshot] = []
        for goal in page.items[:MAX_ACTIVE_GOALS]:
            try:
                snapshots.append(
                    CoachGoalSnapshot(
                        goal_type=_enum_value(goal.goal_type) or "habit",
                        description=goal.description,
                        status=_enum_value(goal.status) or GoalStatus.ACTIVE.value,
                        priority=_enum_value(goal.priority) or "medium",
                        target_metric_type=_enum_value(goal.target_metric_type),
                        target_value=_stringify(goal.target_value),
                        target_unit=goal.target_unit,
                        target_date=goal.target_date,
                    )
                )
            except Exception:
                continue
        return snapshots

    def _training(self, user_id: uuid.UUID) -> CoachTrainingContext:
        try:
            result = self._workout_resolution_service.resolve_current(user_id)
        except Exception:
            return CoachTrainingContext(available=False, reason=_UNAVAILABLE)

        assignment = result.assignment
        workout = result.workout
        try:
            return CoachTrainingContext(
                available=True,
                state=_enum_value(result.state),
                program_name=result.program.name if result.program is not None else None,
                current_week=assignment.current_week_number if assignment is not None else None,
                current_day=assignment.current_day_number if assignment is not None else None,
                today_workout_name=workout.name if workout is not None else None,
                today_log_status=_enum_value(result.today_log_status),
                today_exercises=self._today_exercises(workout),
                recent_sessions=self._recent_sessions(user_id),
            )
        except Exception:
            return CoachTrainingContext(available=False, reason=_UNAVAILABLE)

    def _today_exercises(self, workout: Any) -> list[CoachExerciseSnapshot]:
        if workout is None:
            return []
        try:
            links = list(getattr(workout, "exercise_links", None) or [])
        except Exception:
            return []
        snapshots: list[CoachExerciseSnapshot] = []
        for link in links[:MAX_TODAY_EXERCISES]:
            try:
                exercise = getattr(link, "exercise", None)
                name = getattr(exercise, "name", None) if exercise is not None else None
                if not name:
                    continue
                snapshots.append(
                    CoachExerciseSnapshot(
                        name=name,
                        target_sets=getattr(link, "target_sets", None),
                        target_reps_min=getattr(link, "target_reps_min", None),
                        target_reps_max=getattr(link, "target_reps_max", None),
                        rest_seconds=getattr(link, "rest_seconds", None),
                    )
                )
            except Exception:
                continue
        return snapshots

    def _recent_sessions(self, user_id: uuid.UUID) -> list[CoachSessionSnapshot]:
        try:
            page = self._workout_log_service.list_history(
                user_id, limit=MAX_RECENT_SESSIONS, offset=0
            )
        except Exception:
            return []
        snapshots: list[CoachSessionSnapshot] = []
        for log in page.items[:MAX_RECENT_SESSIONS]:
            try:
                snapshots.append(
                    CoachSessionSnapshot(
                        session_date=self._session_date(log),
                        status=_enum_value(log.status) or "unknown",
                        duration_minutes=log.duration_actual_minutes,
                        workout_name=self._session_workout_name(log),
                        exercises=self._session_exercises(log),
                    )
                )
            except Exception:
                continue
        return snapshots

    @staticmethod
    def _session_date(log: Any) -> date | None:
        scheduled = getattr(log, "scheduled_date", None)
        if scheduled is not None:
            return scheduled
        for attr in ("started_at", "completed_at", "created_at"):
            stamp = getattr(log, attr, None)
            if stamp is not None:
                return stamp.date() if hasattr(stamp, "date") else stamp
        return None

    @staticmethod
    def _session_workout_name(log: Any) -> str | None:
        workout = getattr(log, "workout", None)
        template_name = getattr(workout, "name", None) if workout is not None else None
        if template_name:
            return template_name
        try:
            exercises = list(getattr(log, "log_exercises", None) or [])
        except Exception:
            return None
        names = [
            getattr(item, "exercise_name_snapshot", None)
            for item in exercises
            if getattr(item, "exercise_name_snapshot", None)
        ]
        if not names:
            return None
        return names[0] if len(names) == 1 else f"{names[0]} + {len(names) - 1} more"

    @staticmethod
    def _session_exercises(log: Any) -> list[CoachPerformedExerciseSnapshot]:
        try:
            links = list(getattr(log, "log_exercises", None) or [])
        except Exception:
            return []
        snapshots: list[CoachPerformedExerciseSnapshot] = []
        for item in links[:MAX_TODAY_EXERCISES]:
            try:
                name = getattr(item, "exercise_name_snapshot", None)
                if not name:
                    continue
                snapshots.append(
                    CoachPerformedExerciseSnapshot(
                        name=name,
                        skipped=bool(getattr(item, "skipped", False)),
                        sets=CoachContextAssembler._session_sets(item),
                    )
                )
            except Exception:
                continue
        return snapshots

    @staticmethod
    def _session_sets(log_exercise: Any) -> list[CoachPerformedSetSnapshot]:
        try:
            set_logs = list(getattr(log_exercise, "set_logs", None) or [])
        except Exception:
            return []
        snapshots: list[CoachPerformedSetSnapshot] = []
        for set_log in set_logs[:MAX_SETS_PER_EXERCISE]:
            try:
                set_number = getattr(set_log, "set_number", None)
                if not set_number:
                    continue
                snapshots.append(
                    CoachPerformedSetSnapshot(
                        set_number=set_number,
                        weight_kg=_stringify(getattr(set_log, "weight_kg", None)),
                        reps=getattr(set_log, "reps", None),
                        rpe=_stringify(getattr(set_log, "rpe", None)),
                        duration_seconds=getattr(set_log, "duration_seconds", None),
                        is_warmup=bool(getattr(set_log, "is_warmup", False)),
                    )
                )
            except Exception:
                continue
        return snapshots

    def _nutrition(self, user_id: uuid.UUID, as_of: date) -> CoachNutritionSection:
        try:
            output = self._nutrition_service.get_daily_nutrition(user_id, for_date=as_of)
        except IncompleteNutritionProfileError:
            return CoachNutritionSection(available=False, reason=_INCOMPLETE_PROFILE)
        except Exception:
            return CoachNutritionSection(available=False, reason=_UNAVAILABLE)
        try:
            targets = {key: _stringify(value) or "0" for key, value in output.targets.model_dump().items()}
            actual = {key: _stringify(value) or "0" for key, value in output.actual.model_dump().items()}
            return CoachNutritionSection(
                available=True,
                for_date=output.for_date,
                targets=targets,
                actual=actual,
                adherence=dict(output.adherence),
                meals=self._today_meals(user_id, as_of),
            )
        except Exception:
            return CoachNutritionSection(available=False, reason=_UNAVAILABLE)

    def _today_meals(self, user_id: uuid.UUID, as_of: date) -> list[CoachMealSnapshot]:
        try:
            page = self._nutrition_service.list_meal_logs(
                user_id, date_from=as_of, date_to=as_of, limit=MAX_TODAY_MEALS, offset=0
            )
        except Exception:
            return []
        meals: list[CoachMealSnapshot] = []
        for meal in page.items[:MAX_TODAY_MEALS]:
            try:
                meals.append(
                    CoachMealSnapshot(
                        name=meal.name_snapshot,
                        meal_type=_enum_value(meal.meal_type) or "other",
                        calories=_stringify(meal.calories) or "0",
                        protein_g=_stringify(meal.protein_g) or "0",
                        carbs_g=_stringify(meal.carbs_g) or "0",
                        fat_g=_stringify(meal.fat_g) or "0",
                    )
                )
            except Exception:
                continue
        return meals

    def _recovery(self, user_id: uuid.UUID, as_of: date) -> CoachRecoverySection:
        try:
            output = self._recovery_service.get_daily_readiness(user_id, for_date=as_of)
        except CheckInNotFoundError:
            return CoachRecoverySection(available=False, reason=_MISSING_CHECKIN)
        except Exception:
            return CoachRecoverySection(available=False, reason=_UNAVAILABLE)

        sleep_hours = None
        sleep_quality = None
        soreness = None
        fatigue = None
        try:
            page = self._recovery_service.list_check_ins(
                user_id, date_from=as_of, date_to=as_of, limit=1, offset=0
            )
            if page.items:
                check_in = page.items[0]
                sleep_hours = _stringify(check_in.sleep_hours)
                sleep_quality = check_in.sleep_quality
                soreness = check_in.soreness
                fatigue = check_in.fatigue
        except Exception:
            pass

        try:
            return CoachRecoverySection(
                available=True,
                for_date=output.for_date,
                readiness_score=_stringify(output.readiness_score),
                readiness_level=_enum_value(output.readiness_level),
                sleep_hours=sleep_hours,
                sleep_quality=sleep_quality,
                soreness=soreness,
                fatigue=fatigue,
                protocols=list(output.protocols),
            )
        except Exception:
            return CoachRecoverySection(available=False, reason=_UNAVAILABLE)

    def _progress(self, user_id: uuid.UUID) -> list[CoachProgressSnapshot]:
        try:
            page = self._progress_service.list_progress(
                user_id, limit=MAX_PROGRESS_ENTRIES, offset=0
            )
        except Exception:
            return []
        snapshots: list[CoachProgressSnapshot] = []
        for entry in page.items[:MAX_PROGRESS_ENTRIES]:
            try:
                snapshots.append(
                    CoachProgressSnapshot(
                        metric_type=_enum_value(entry.metric_type) or "body_weight",
                        value=_stringify(entry.value) or "0",
                        unit=entry.unit,
                        recorded_date=entry.recorded_date,
                    )
                )
            except Exception:
                continue
        return snapshots

"""Coach-facing engine adapters — bridge domain Services into the AIOrchestrator.

Resolves the binding question Decisions 011 and 016 both explicitly
deferred: how ``NutritionInput``/``NutritionOutput`` and
``RecoveryInput``/``RecoveryOutput`` (and the Workout side, which has no AI
engine at all — see Decision 006) adapt onto the generic
``EngineInput``/``EngineOutput`` contract consumed by
``AIOrchestrator.engines``. See Decision 017 in ``docs/DECISIONS.md``.

Each adapter here implements the :class:`~app.ai.engine.AIEngine` protocol
and depends on the corresponding domain **Service** —
:class:`~app.services.workout_resolution_service.WorkoutResolutionService`,
:class:`~app.services.nutrition_service.NutritionService`,
:class:`~app.services.recovery_service.RecoveryService` — never a repository
directly, matching the "Engines -> Services" arrow already drawn in
``EVOLVE_ARCHITECTURE.md`` §2's layer diagram. The pure ``NutritionEngine``/
``RecoveryEngine`` and ``WorkoutResolutionService`` are untouched by this
module; each adapter simply calls the Service's existing public method
(defaulting to today), catches its documented "missing data" exception, and
formats the result into a templated ``reply_text`` plus a JSON-safe
``artifacts`` dict — a Coach message must never surface as an unhandled 500
just because the user hasn't completed their profile or logged a check-in
yet.

Stateless per invocation, per ``EVOLVE_ARCHITECTURE.md`` §4's "Engine
Interaction Rules": each adapter carries only its injected Service, and
``handle()`` reads everything else it needs from the given ``EngineInput``.
"""

from app.ai.contracts import EngineInput, EngineOutput
from app.ai.nutrition_engine import NutritionOutput
from app.ai.recovery_engine import RecoveryOutput
from app.schemas.workout_resolution import TodayLogStatus, WorkoutResolutionState
from app.services.nutrition_service import IncompleteNutritionProfileError, NutritionService
from app.services.recovery_service import CheckInNotFoundError, RecoveryService
from app.services.workout_resolution_service import ResolutionResult, WorkoutResolutionService

__all__ = ["WorkoutCoachEngine", "NutritionCoachEngine", "RecoveryCoachEngine"]


class WorkoutCoachEngine:
    """Adapts :class:`WorkoutResolutionService`'s resolved program position into a Coach reply.

    ``WorkoutResolutionService.resolve_current`` never raises (it models
    "no active program" as a state, not an error — see Decision 006), so
    unlike the other two adapters this one has no exception path to guard
    against.
    """

    name = "workout_coach_engine"

    def __init__(self, workout_resolution_service: WorkoutResolutionService) -> None:
        self._service = workout_resolution_service

    def handle(self, engine_input: EngineInput) -> EngineOutput:
        """Resolve the user's current program position and describe it in natural language."""
        result = self._service.resolve_current(engine_input.user_id)
        return EngineOutput(
            engine_name=self.name,
            reply_text=self._build_reply(result),
            artifacts=self._build_artifacts(result),
        )

    @staticmethod
    def _build_reply(result: ResolutionResult) -> str:
        """Return a templated reply per resolved state.

        ``ResolutionResult`` carries no natural-language summary of its
        own — this is the one place that text is generated, kept here
        rather than on the service (which stays pure, DB-facing business
        logic per its own docstring) or the schema layer (which only
        projects for the standalone `/api/v1/workout-resolution` REST API).
        """
        if result.state == WorkoutResolutionState.NO_ACTIVE_PROGRAM:
            return (
                "You don't have an active program right now. Start one and "
                "I can tell you exactly what to do each day."
            )
        if result.state == WorkoutResolutionState.PROGRAM_COMPLETE:
            program_name = result.program.name if result.program else "your program"
            return (
                f"You've completed every scheduled day in {program_name}. "
                "Nice work — assign a new program to keep going."
            )
        if result.state == WorkoutResolutionState.REST_DAY:
            return "Today is a scheduled rest day. Recover well and you'll be ready for your next session."

        workout_name = result.workout.name if result.workout else "your workout"
        if result.today_log_status == TodayLogStatus.COMPLETED:
            return f"You've already completed today's session ({workout_name}). Great job!"
        if result.today_log_status == TodayLogStatus.SKIPPED:
            return f"You skipped today's session ({workout_name}) — ready to get back on track next time."
        if result.today_log_status == TodayLogStatus.IN_PROGRESS:
            return f"You have {workout_name} in progress right now — finish it up when you're ready."
        return f"Today's training day: {workout_name}. Let's get to work."

    @staticmethod
    def _build_artifacts(result: ResolutionResult) -> dict:
        """Return a JSON-safe projection of ``result`` for the persisted chat artifact."""
        return {
            "state": result.state.value,
            "program_name": result.program.name if result.program else None,
            "workout_name": result.workout.name if result.workout else None,
            "today_log_status": result.today_log_status.value,
            "active_workout_log_id": (
                str(result.active_workout_log_id) if result.active_workout_log_id else None
            ),
        }


class NutritionCoachEngine:
    """Adapts :class:`NutritionService`'s daily targets/adherence into a Coach reply."""

    name = "nutrition_coach_engine"

    def __init__(self, nutrition_service: NutritionService) -> None:
        self._service = nutrition_service

    def handle(self, engine_input: EngineInput) -> EngineOutput:
        """Compute today's nutrition targets/adherence, or guide the user to complete their profile.

        Never lets :class:`IncompleteNutritionProfileError` propagate — a
        Coach message must degrade gracefully, not surface as a 500.
        """
        try:
            output = self._service.get_daily_nutrition(engine_input.user_id)
        except IncompleteNutritionProfileError as exc:
            return EngineOutput(
                engine_name=self.name,
                reply_text=f"I can't compute your nutrition targets yet: {exc}",
                artifacts=None,
            )
        return EngineOutput(
            engine_name=self.name,
            reply_text=output.summary_text,
            artifacts=self._build_artifacts(output),
        )

    @staticmethod
    def _build_artifacts(output: NutritionOutput) -> dict:
        """Return a JSON-safe projection of ``output`` for the persisted chat artifact."""
        return {
            "for_date": output.for_date.isoformat(),
            "targets": {key: str(value) for key, value in output.targets.model_dump().items()},
            "actual": {key: str(value) for key, value in output.actual.model_dump().items()},
            "adherence": output.adherence,
        }


class RecoveryCoachEngine:
    """Adapts :class:`RecoveryService`'s daily readiness scoring into a Coach reply."""

    name = "recovery_coach_engine"

    def __init__(self, recovery_service: RecoveryService) -> None:
        self._service = recovery_service

    def handle(self, engine_input: EngineInput) -> EngineOutput:
        """Compute today's readiness score, or guide the user to log a check-in first.

        Never lets :class:`CheckInNotFoundError` propagate — a Coach
        message must degrade gracefully, not surface as a 500.
        """
        try:
            output = self._service.get_daily_readiness(engine_input.user_id)
        except CheckInNotFoundError:
            return EngineOutput(
                engine_name=self.name,
                reply_text=(
                    "I don't have a readiness check-in for today yet. Log your "
                    "sleep, soreness, and fatigue and I can tell you how ready "
                    "you are to train."
                ),
                artifacts=None,
            )
        return EngineOutput(
            engine_name=self.name,
            reply_text=output.recommendation_text,
            artifacts=self._build_artifacts(output),
        )

    @staticmethod
    def _build_artifacts(output: RecoveryOutput) -> dict:
        """Return a JSON-safe projection of ``output`` for the persisted chat artifact."""
        return {
            "for_date": output.for_date.isoformat(),
            "readiness_score": str(output.readiness_score),
            "readiness_level": output.readiness_level.value,
            "protocols": output.protocols,
        }

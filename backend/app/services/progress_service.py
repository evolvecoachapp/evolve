"""Business logic for the Progress domain — entry logging and AI-driven summaries.

``ProgressService`` composes :class:`~app.repositories.progress_repository.ProgressRepository`,
:class:`~app.repositories.goal_repository.GoalRepository`, and
:class:`~app.repositories.exercise_repository.ExerciseRepository` with the
:class:`~app.ai.progress_analyzer.ProgressAnalyzer` — matching
:class:`~app.services.recovery_service.RecoveryService`'s precedent of
composing exactly the repositories/engine one workflow needs, no
service-to-service composition. It covers two areas:

- **Entry CRUD** — log a new (always ``source=MANUAL`` this sprint) entry,
  read, list, and soft-delete a personal progress entry.
- **AI-driven summary** — assemble a :class:`~app.ai.progress_analyzer.ProgressAnalyzerInput`
  from a window of a user's logged entries plus an optional linked goal,
  and delegate the actual trend/narrative computation to
  :class:`~app.ai.progress_analyzer.ProgressAnalyzer`.

:meth:`get_progress_summary` is the first **service** method in the
codebase to be ``async def`` — an explicit, documented second ripple of
Decision 009's async boundary (the first being the Orchestrator/LLMProvider
themselves) — because it awaits :meth:`~app.ai.progress_analyzer.ProgressAnalyzer.handle`.

Contains no HTTP concepts and no raw SQL — the API layer translates this
service's return values and documented exceptions into request/response
schemas and HTTP status codes.
"""

import uuid
from datetime import date, timedelta

from app.ai.progress_analyzer import (
    GoalSnapshot,
    InsufficientProgressDataError,
    ProgressAnalyzer,
    ProgressAnalyzerInput,
    ProgressAnalyzerOutput,
    ProgressDataPoint,
)
from app.models.goal import Goal
from app.models.progress import Progress, ProgressMetricType, ProgressSource
from app.repositories.exercise_repository import ExerciseRepository
from app.repositories.goal_repository import GoalRepository
from app.repositories.progress_repository import ProgressRepository
from app.schemas.progress import ProgressEntryCreate
from app.utils.datetime import utcnow
from app.utils.pagination import Page, clamp_pagination

__all__ = [
    "ProgressServiceError",
    "ProgressEntryNotFoundError",
    "InvalidProgressReferenceError",
    "InsufficientProgressDataError",
    "ProgressService",
    "DEFAULT_SUMMARY_WINDOW_DAYS",
]

DEFAULT_SUMMARY_WINDOW_DAYS = 90
"""Default trailing-window length (in days) for :meth:`ProgressService.get_progress_summary`."""


class ProgressServiceError(Exception):
    """Base class for all errors raised by :class:`ProgressService`."""


class ProgressEntryNotFoundError(ProgressServiceError):
    """Raised when a referenced progress entry does not resolve to one owned by this user."""


class InvalidProgressReferenceError(ProgressServiceError):
    """Raised when a referenced ``goal_id``/``exercise_id`` does not resolve for this user."""


class ProgressService:
    """Progress entry CRUD and AI-driven summary workflows.

    Depends on injected repositories and an injected
    :class:`~app.ai.progress_analyzer.ProgressAnalyzer`, so it can be
    unit-tested with mocks (matches
    :class:`~app.services.recovery_service.RecoveryService`).
    """

    def __init__(
        self,
        progress_repository: ProgressRepository,
        goal_repository: GoalRepository,
        exercise_repository: ExerciseRepository,
        analyzer: ProgressAnalyzer,
    ) -> None:
        self.progress_repository = progress_repository
        self.goal_repository = goal_repository
        self.exercise_repository = exercise_repository
        self._analyzer = analyzer

    # -- Entry CRUD -----------------------------------------------------------

    def log_progress_entry(self, user_id: uuid.UUID, data: ProgressEntryCreate) -> Progress:
        """Log a new (``source=MANUAL``) progress entry for ``user_id``.

        Raises:
            InvalidProgressReferenceError: If ``data.goal_id`` or
                ``data.exercise_id`` is given but does not resolve (for
                ``goal_id``: to a goal owned by ``user_id``).
        """
        if data.goal_id is not None:
            goal = self.goal_repository.get_by_id(data.goal_id)
            if goal is None or goal.deleted_at is not None or goal.user_id != user_id:
                raise InvalidProgressReferenceError(f"Goal {data.goal_id} not found.")
        if data.exercise_id is not None:
            exercise = self.exercise_repository.get_by_id(data.exercise_id)
            if exercise is None:
                raise InvalidProgressReferenceError(f"Exercise {data.exercise_id} not found.")

        entry = Progress(
            user_id=user_id,
            goal_id=data.goal_id,
            exercise_id=data.exercise_id,
            metric_type=data.metric_type,
            value=data.value,
            unit=data.unit,
            recorded_date=data.recorded_date,
            source=ProgressSource.MANUAL,
            notes=data.notes,
        )
        created = self.progress_repository.create(entry)
        self.progress_repository.db.commit()
        return created

    def get_progress_entry(self, user_id: uuid.UUID, entry_id: uuid.UUID) -> Progress:
        """Return a single progress entry owned by ``user_id``.

        Raises:
            ProgressEntryNotFoundError: If ``entry_id`` does not resolve, or
                is not owned by ``user_id``.
        """
        return self._get_owned_entry_or_raise(user_id, entry_id)

    def list_progress(
        self,
        user_id: uuid.UUID,
        *,
        metric_type: ProgressMetricType | None = None,
        goal_id: uuid.UUID | None = None,
        date_from: date | None = None,
        date_to: date | None = None,
        limit: int = 20,
        offset: int = 0,
    ) -> Page[Progress]:
        """Return a filtered, paginated page of a user's progress entries, most recent first."""
        safe_limit, safe_offset = clamp_pagination(limit, offset)
        items = self.progress_repository.list_for_user(
            user_id,
            metric_type=metric_type,
            goal_id=goal_id,
            date_from=date_from,
            date_to=date_to,
            limit=safe_limit,
            offset=safe_offset,
        )
        total = self.progress_repository.count(
            user_id, metric_type=metric_type, goal_id=goal_id, date_from=date_from, date_to=date_to
        )
        return Page(items=items, total=total, limit=safe_limit, offset=safe_offset)

    def delete_progress_entry(self, user_id: uuid.UUID, entry_id: uuid.UUID) -> None:
        """Soft-delete a progress entry owned by ``user_id``.

        Raises:
            ProgressEntryNotFoundError: If ``entry_id`` does not resolve, or
                is not owned by ``user_id``.
        """
        entry = self._get_owned_entry_or_raise(user_id, entry_id)
        self.progress_repository.delete(entry)
        self.progress_repository.db.commit()

    # -- AI-driven summary -----------------------------------------------------

    async def get_progress_summary(
        self,
        user_id: uuid.UUID,
        metric_type: ProgressMetricType,
        *,
        goal_id: uuid.UUID | None = None,
        date_from: date | None = None,
        date_to: date | None = None,
    ) -> tuple[ProgressAnalyzerOutput, date, date, str]:
        """Compute a trend/consistency/plateau summary and narrative for one metric.

        Args:
            user_id: The user to summarize progress for.
            metric_type: Which metric to analyze.
            goal_id: If given, restricts to entries linked to that goal and
                includes its target in the analysis; must be owned by
                ``user_id``.
            date_from: Start of the analysis window; defaults to
                ``DEFAULT_SUMMARY_WINDOW_DAYS`` days before ``date_to``.
            date_to: End of the analysis window; defaults to today (UTC).

        Returns:
            A tuple of ``(analyzer_output, window_start, window_end, unit)``
            — the resolved window bounds and unit are returned alongside
            the output since the API layer needs them for the response
            schema.

        Raises:
            InvalidProgressReferenceError: If ``goal_id`` is given but does
                not resolve to a goal owned by ``user_id``.
            InsufficientProgressDataError: If fewer than
                ``settings.progress_min_data_points_for_trend`` entries fall
                within the resolved window.
        """
        window_end = date_to if date_to is not None else utcnow().date()
        window_start = (
            date_from if date_from is not None else window_end - timedelta(days=DEFAULT_SUMMARY_WINDOW_DAYS)
        )

        goal_snapshot: GoalSnapshot | None = None
        if goal_id is not None:
            goal = self.goal_repository.get_by_id(goal_id)
            if goal is None or goal.deleted_at is not None or goal.user_id != user_id:
                raise InvalidProgressReferenceError(f"Goal {goal_id} not found.")
            goal_snapshot = self._build_goal_snapshot(goal)

        entries = self.progress_repository.list_for_trend(
            user_id, metric_type, date_from=window_start, date_to=window_end
        )
        if goal_id is not None:
            entries = [entry for entry in entries if entry.goal_id == goal_id]

        unit = entries[0].unit if entries else (goal_snapshot.target_unit if goal_snapshot else "")
        analyzer_input = ProgressAnalyzerInput(
            user_id=user_id,
            metric_type=metric_type,
            unit=unit,
            data_points=[
                ProgressDataPoint(recorded_date=entry.recorded_date, value=entry.value)
                for entry in entries
            ],
            window_start=window_start,
            window_end=window_end,
            goal=goal_snapshot,
        )
        output = await self._analyzer.handle(analyzer_input)
        return output, window_start, window_end, unit

    # -- Internal helpers -----------------------------------------------------

    @staticmethod
    def _build_goal_snapshot(goal: Goal) -> GoalSnapshot | None:
        if goal.target_value is None or goal.target_unit is None:
            return None
        return GoalSnapshot(
            target_value=goal.target_value, target_unit=goal.target_unit, target_date=goal.target_date
        )

    def _get_owned_entry_or_raise(self, user_id: uuid.UUID, entry_id: uuid.UUID) -> Progress:
        entry = self.progress_repository.get_by_id(entry_id)
        if entry is None or entry.deleted_at is not None or entry.user_id != user_id:
            raise ProgressEntryNotFoundError("Progress entry not found.")
        return entry

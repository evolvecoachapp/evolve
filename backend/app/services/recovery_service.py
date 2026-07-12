"""Business logic for the Recovery Check-In domain and daily readiness scoring.

``RecoveryService`` is the only layer that composes
:class:`~app.repositories.recovery_repository.RecoveryCheckInRepository`
and :class:`~app.repositories.workout_log_repository.WorkoutLogRepository`
with the :class:`~app.ai.recovery_engine.RecoveryEngine` — no
service-to-service composition, matching
:class:`~app.services.nutrition_service.NutritionService`'s precedent. It
covers two areas:

- **Check-in CRUD** — create (enforcing the one-per-day rule), read,
  list, update, and soft-delete a personal readiness check-in.
- **Daily readiness** — assemble a :class:`~app.ai.recovery_engine.RecoveryInput`
  from that date's check-in plus a trailing training-load window derived
  from ``WorkoutLog`` history (see Decision 014 in ``docs/DECISIONS.md``),
  and delegate the actual scoring to :class:`~app.ai.recovery_engine.RecoveryEngine`.

Contains no HTTP concepts and no raw SQL — the API layer translates this
service's return values and documented exceptions into request/response
schemas and HTTP status codes.
"""

import uuid
from datetime import date, timedelta

from app.ai.recovery_engine import RecoveryEngine, RecoveryInput, RecoveryOutput, TrainingLoadSummary
from app.core.config import settings
from app.models.recovery import RecoveryCheckIn
from app.repositories.recovery_repository import RecoveryCheckInRepository
from app.repositories.workout_log_repository import WorkoutLogRepository
from app.schemas.recovery import RecoveryCheckInCreate, RecoveryCheckInUpdate
from app.utils.datetime import utcnow
from app.utils.pagination import Page, clamp_pagination

__all__ = [
    "RecoveryServiceError",
    "CheckInNotFoundError",
    "CheckInAlreadyExistsError",
    "RecoveryService",
]


class RecoveryServiceError(Exception):
    """Base class for all errors raised by :class:`RecoveryService`."""


class CheckInNotFoundError(RecoveryServiceError):
    """Raised when a referenced check-in does not resolve to one owned by this user."""


class CheckInAlreadyExistsError(RecoveryServiceError):
    """Raised when creating a check-in for a date the user already has one for.

    Enforces the one-check-in-per-``(user_id, checkin_date)`` rule at the
    service layer, ahead of (and consistent with) the database's unique
    constraint — see Decision 015 in ``docs/DECISIONS.md``.
    """


class RecoveryService:
    """Check-in CRUD and daily readiness scoring workflows.

    Depends on injected repositories rather than raw
    :class:`~sqlalchemy.orm.Session` instances, so it can be unit-tested
    with mocks (matches :class:`~app.services.nutrition_service.NutritionService`).
    """

    def __init__(
        self,
        recovery_repository: RecoveryCheckInRepository,
        workout_log_repository: WorkoutLogRepository,
    ) -> None:
        self.recovery_repository = recovery_repository
        self.workout_log_repository = workout_log_repository
        self._engine = RecoveryEngine()

    # -- Check-in CRUD -------------------------------------------------------

    def create_check_in(
        self, user_id: uuid.UUID, data: RecoveryCheckInCreate
    ) -> RecoveryCheckIn:
        """Create a new check-in for ``user_id`` on ``data.checkin_date``.

        Raises:
            CheckInAlreadyExistsError: If ``user_id`` already has a
                (non-deleted) check-in for that date.
        """
        existing = self.recovery_repository.get_for_user_and_date(user_id, data.checkin_date)
        if existing is not None:
            raise CheckInAlreadyExistsError(
                f"A check-in for {data.checkin_date} already exists. Update it instead."
            )

        check_in = RecoveryCheckIn(
            user_id=user_id,
            checkin_date=data.checkin_date,
            sleep_hours=data.sleep_hours,
            sleep_quality=data.sleep_quality,
            soreness=data.soreness,
            fatigue=data.fatigue,
            resting_heart_rate=data.resting_heart_rate,
            hrv_ms=data.hrv_ms,
            notes=data.notes,
        )
        created = self.recovery_repository.create(check_in)
        self.recovery_repository.db.commit()
        return created

    def update_check_in(
        self, user_id: uuid.UUID, check_in_id: uuid.UUID, data: RecoveryCheckInUpdate
    ) -> RecoveryCheckIn:
        """Partially update a check-in owned by ``user_id``.

        Raises:
            CheckInNotFoundError: If ``check_in_id`` does not resolve, or
                is not owned by ``user_id``.
        """
        check_in = self._get_owned_check_in_or_raise(user_id, check_in_id)

        if data.sleep_hours is not None:
            check_in.sleep_hours = data.sleep_hours
        if data.sleep_quality is not None:
            check_in.sleep_quality = data.sleep_quality
        if data.soreness is not None:
            check_in.soreness = data.soreness
        if data.fatigue is not None:
            check_in.fatigue = data.fatigue
        if data.resting_heart_rate is not None:
            check_in.resting_heart_rate = data.resting_heart_rate
        if data.hrv_ms is not None:
            check_in.hrv_ms = data.hrv_ms
        if data.notes is not None:
            check_in.notes = data.notes

        updated = self.recovery_repository.update(check_in)
        self.recovery_repository.db.commit()
        return updated

    def get_check_in(self, user_id: uuid.UUID, check_in_id: uuid.UUID) -> RecoveryCheckIn:
        """Return a single check-in owned by ``user_id``.

        Raises:
            CheckInNotFoundError: If ``check_in_id`` does not resolve, or
                is not owned by ``user_id``.
        """
        return self._get_owned_check_in_or_raise(user_id, check_in_id)

    def list_check_ins(
        self,
        user_id: uuid.UUID,
        *,
        date_from: date | None = None,
        date_to: date | None = None,
        limit: int = 20,
        offset: int = 0,
    ) -> Page[RecoveryCheckIn]:
        """Return a filtered, paginated page of a user's check-ins, most recent first."""
        safe_limit, safe_offset = clamp_pagination(limit, offset)
        items = self.recovery_repository.list_for_user(
            user_id, date_from=date_from, date_to=date_to, limit=safe_limit, offset=safe_offset
        )
        total = self.recovery_repository.count(user_id, date_from=date_from, date_to=date_to)
        return Page(items=items, total=total, limit=safe_limit, offset=safe_offset)

    def delete_check_in(self, user_id: uuid.UUID, check_in_id: uuid.UUID) -> None:
        """Soft-delete a check-in owned by ``user_id``.

        Raises:
            CheckInNotFoundError: If ``check_in_id`` does not resolve, or
                is not owned by ``user_id``.
        """
        check_in = self._get_owned_check_in_or_raise(user_id, check_in_id)
        self.recovery_repository.delete(check_in)
        self.recovery_repository.db.commit()

    # -- Daily readiness -----------------------------------------------------

    def get_daily_readiness(
        self, user_id: uuid.UUID, *, for_date: date | None = None
    ) -> RecoveryOutput:
        """Compute a user's readiness score/level/guidance for a single day.

        Args:
            user_id: The user to compute readiness for.
            for_date: The calendar date to score; defaults to today (UTC).

        Raises:
            CheckInNotFoundError: If ``user_id`` has no check-in for
                ``for_date`` — readiness cannot be computed without one.
        """
        resolved_date = for_date if for_date is not None else utcnow().date()

        check_in = self.recovery_repository.get_for_user_and_date(user_id, resolved_date)
        if check_in is None:
            raise CheckInNotFoundError(
                f"No check-in found for {resolved_date}. Log a check-in for that date first."
            )

        window_days = settings.recovery_training_load_window_days
        window_start = resolved_date - timedelta(days=window_days - 1)
        raw_summary = self.workout_log_repository.get_training_load_summary(
            user_id, date_from=window_start, date_to=resolved_date
        )
        training_load = TrainingLoadSummary(
            session_count=raw_summary["session_count"],
            total_duration_minutes=raw_summary["total_duration_minutes"],
            avg_rpe=raw_summary["avg_rpe"],
            window_days=window_days,
        )

        recovery_input = RecoveryInput(
            sleep_hours=check_in.sleep_hours,
            sleep_quality=check_in.sleep_quality,
            soreness=check_in.soreness,
            fatigue=check_in.fatigue,
            training_load=training_load,
            for_date=resolved_date,
        )
        return self._engine.handle(recovery_input)

    # -- Internal helpers -----------------------------------------------------

    def _get_owned_check_in_or_raise(
        self, user_id: uuid.UUID, check_in_id: uuid.UUID
    ) -> RecoveryCheckIn:
        check_in = self.recovery_repository.get_by_id(check_in_id)
        if (
            check_in is None
            or check_in.deleted_at is not None
            or check_in.user_id != user_id
        ):
            raise CheckInNotFoundError("Check-in not found.")
        return check_in

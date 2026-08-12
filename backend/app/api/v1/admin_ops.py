"""Admin feature-management routes — catalog, programs, logs, nutrition, recovery, goals, coach.

Routes stay thin: every handler requires ``get_current_superuser``. Reads
delegate to existing domain services. Mutations go through
:class:`~app.services.admin_service.AdminService.run_audited` so the
existing audit trail records the outcome without duplicating domain logic.
Hard-delete of catalog entities is not exposed — only deactivate/archive
methods that already exist on domain services.
"""

from __future__ import annotations

import uuid
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.ai.nutrition_engine import IncompleteNutritionProfileError
from app.ai.progress_analyzer import InsufficientProgressDataError
from app.core.dependencies import (
    get_admin_service,
    get_catalog_service,
    get_coach_service,
    get_exercise_service,
    get_goal_service,
    get_nutrition_service,
    get_progress_service,
    get_recovery_service,
    get_workout_log_service,
    get_workout_service,
)
from app.models.exercise import DifficultyLevel, ExerciseCategory
from app.models.goal import GoalStatus
from app.models.program import ProgramStatus
from app.models.progress import ProgressMetricType
from app.models.user import User
from app.models.workout_log import WorkoutLogStatus
from app.schemas.admin import (
    AdminConversationPage,
    AdminConversationRead,
    AdminProgramDetail,
    AdminWorkoutLogPage,
    AdminWorkoutLogSummary,
)
from app.schemas.catalog import EquipmentCreate, EquipmentRead, MuscleGroupCreate, MuscleGroupRead
from app.schemas.coach import ChatMessagePage, ChatMessageRead
from app.schemas.exercise import ExerciseCreate, ExercisePage, ExercisePublic, ExerciseUpdate
from app.schemas.goal import GoalPage, GoalRead
from app.schemas.nutrition import DailyNutritionRead, MealLogPage, MealLogRead, MealPage, MealRead
from app.schemas.program import (
    ProgramAssignmentRead,
    ProgramCreate,
    ProgramDayInput,
    ProgramDayRead,
    ProgramPage,
    ProgramPublic,
    ProgramUpdate,
)
from app.schemas.progress import ProgressEntryPage, ProgressEntryRead, ProgressSummaryRead
from app.schemas.recovery import ReadinessRead, RecoveryCheckInPage, RecoveryCheckInRead
from app.schemas.workout import WorkoutCreate, WorkoutPage, WorkoutPublic, WorkoutUpdate
from app.schemas.workout_log import WorkoutLogDetail
from app.security.dependencies import get_current_superuser
from app.services.admin_service import (
    ADMIN_CATALOG_EQUIPMENT_CREATE,
    ADMIN_CATALOG_MUSCLE_GROUP_CREATE,
    ADMIN_EXERCISE_CREATE,
    ADMIN_EXERCISE_DEACTIVATE,
    ADMIN_EXERCISE_UPDATE,
    ADMIN_PROGRAM_ARCHIVE,
    ADMIN_PROGRAM_CREATE,
    ADMIN_PROGRAM_DAY_ADD,
    ADMIN_PROGRAM_DAY_REMOVE,
    ADMIN_PROGRAM_PUBLISH,
    ADMIN_PROGRAM_UPDATE,
    ADMIN_WORKOUT_CREATE,
    ADMIN_WORKOUT_DEACTIVATE,
    ADMIN_WORKOUT_UPDATE,
    AdminService,
)
from app.services.catalog_service import (
    CatalogService,
    EquipmentAlreadyExistsError,
    MuscleGroupAlreadyExistsError,
)
from app.services.coach_service import CoachService, ConversationAccessDeniedError
from app.services.exercise_service import (
    ExerciseAlreadyExistsError,
    ExerciseNotFoundError,
    ExerciseService,
    InvalidCatalogReferenceError,
)
from app.services.goal_service import GoalNotFoundError, GoalService
from app.services.nutrition_service import MealLogNotFoundError, MealNotFoundError, NutritionService
from app.services.progress_service import (
    InvalidProgressReferenceError,
    ProgressEntryNotFoundError,
    ProgressService,
)
from app.services.recovery_service import CheckInNotFoundError, RecoveryService
from app.services.workout_log_service import WorkoutLogNotFoundError, WorkoutLogService
from app.services.workout_service import (
    InvalidProgramDayError,
    InvalidProgramStateError,
    ProgramAlreadyExistsError,
    ProgramNotFoundError,
    WorkoutAlreadyExistsError,
    WorkoutNotFoundError,
    WorkoutService,
    InvalidExerciseReferenceError,
)

router = APIRouter()


def _not_found(detail: str) -> HTTPException:
    return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=detail)


def _conflict(detail: str) -> HTTPException:
    return HTTPException(status_code=status.HTTP_409_CONFLICT, detail=detail)


def _bad_request(detail: str) -> HTTPException:
    return HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)


def _unprocessable(detail: str) -> HTTPException:
    return HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=detail)


# -- Catalog: muscle groups / equipment ------------------------------------


@router.get("/muscle-groups", response_model=list[MuscleGroupRead])
def list_admin_muscle_groups(
    _current_user: User = Depends(get_current_superuser),
    catalog_service: CatalogService = Depends(get_catalog_service),
) -> list[MuscleGroupRead]:
    """Return the full muscle-group taxonomy."""
    return [MuscleGroupRead.model_validate(item) for item in catalog_service.list_muscle_groups()]


@router.post("/muscle-groups", response_model=MuscleGroupRead, status_code=status.HTTP_201_CREATED)
def create_admin_muscle_group(
    data: MuscleGroupCreate,
    current_user: User = Depends(get_current_superuser),
    catalog_service: CatalogService = Depends(get_catalog_service),
    admin_service: AdminService = Depends(get_admin_service),
) -> MuscleGroupRead:
    """Create a muscle-group catalog entry via CatalogService."""
    try:
        created = admin_service.run_audited(
            actor_id=current_user.id,
            action=ADMIN_CATALOG_MUSCLE_GROUP_CREATE,
            target_type="muscle_group",
            operation=lambda: catalog_service.create_muscle_group(data),
        )
    except MuscleGroupAlreadyExistsError as exc:
        raise _conflict("Muscle group already exists.") from exc
    return MuscleGroupRead.model_validate(created)


@router.get("/equipment", response_model=list[EquipmentRead])
def list_admin_equipment(
    _current_user: User = Depends(get_current_superuser),
    catalog_service: CatalogService = Depends(get_catalog_service),
) -> list[EquipmentRead]:
    """Return the full equipment taxonomy."""
    return [EquipmentRead.model_validate(item) for item in catalog_service.list_equipment()]


@router.post("/equipment", response_model=EquipmentRead, status_code=status.HTTP_201_CREATED)
def create_admin_equipment(
    data: EquipmentCreate,
    current_user: User = Depends(get_current_superuser),
    catalog_service: CatalogService = Depends(get_catalog_service),
    admin_service: AdminService = Depends(get_admin_service),
) -> EquipmentRead:
    """Create an equipment catalog entry via CatalogService."""
    try:
        created = admin_service.run_audited(
            actor_id=current_user.id,
            action=ADMIN_CATALOG_EQUIPMENT_CREATE,
            target_type="equipment",
            operation=lambda: catalog_service.create_equipment(data),
        )
    except EquipmentAlreadyExistsError as exc:
        raise _conflict("Equipment already exists.") from exc
    return EquipmentRead.model_validate(created)


# -- Exercises -------------------------------------------------------------


@router.get("/exercises", response_model=ExercisePage)
def list_admin_exercises(
    category: ExerciseCategory | None = None,
    difficulty_level: DifficultyLevel | None = None,
    muscle_group_id: uuid.UUID | None = None,
    equipment_id: uuid.UUID | None = None,
    q: str | None = Query(default=None),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    _current_user: User = Depends(get_current_superuser),
    exercise_service: ExerciseService = Depends(get_exercise_service),
) -> ExercisePage:
    """Return a filtered, paginated page of exercises, including inactive rows."""
    page = exercise_service.list_exercises(
        category=category,
        difficulty_level=difficulty_level,
        muscle_group_id=muscle_group_id,
        equipment_id=equipment_id,
        search=q,
        include_inactive=True,
        limit=limit,
        offset=offset,
    )
    return ExercisePage(
        items=[ExercisePublic.from_model(item) for item in page.items],
        total=page.total,
        limit=page.limit,
        offset=page.offset,
    )


@router.post("/exercises", response_model=ExercisePublic, status_code=status.HTTP_201_CREATED)
def create_admin_exercise(
    data: ExerciseCreate,
    current_user: User = Depends(get_current_superuser),
    exercise_service: ExerciseService = Depends(get_exercise_service),
    admin_service: AdminService = Depends(get_admin_service),
) -> ExercisePublic:
    """Create an exercise via ExerciseService and audit the mutation."""
    try:
        created = admin_service.run_audited(
            actor_id=current_user.id,
            action=ADMIN_EXERCISE_CREATE,
            target_type="exercise",
            operation=lambda: exercise_service.create_exercise(
                data, created_by_id=current_user.id
            ),
        )
    except ExerciseAlreadyExistsError as exc:
        raise _conflict("Exercise already exists.") from exc
    except InvalidCatalogReferenceError as exc:
        raise _bad_request("Unknown muscle group or equipment reference.") from exc
    return ExercisePublic.from_model(created)


@router.get("/exercises/{exercise_id}", response_model=ExercisePublic)
def get_admin_exercise(
    exercise_id: uuid.UUID,
    _current_user: User = Depends(get_current_superuser),
    exercise_service: ExerciseService = Depends(get_exercise_service),
) -> ExercisePublic:
    """Return a single exercise, including inactive catalog rows."""
    try:
        exercise = exercise_service.get_exercise(exercise_id, include_inactive=True)
    except ExerciseNotFoundError as exc:
        raise _not_found("Exercise not found.") from exc
    return ExercisePublic.from_model(exercise)


@router.patch("/exercises/{exercise_id}", response_model=ExercisePublic)
def update_admin_exercise(
    exercise_id: uuid.UUID,
    data: ExerciseUpdate,
    current_user: User = Depends(get_current_superuser),
    exercise_service: ExerciseService = Depends(get_exercise_service),
    admin_service: AdminService = Depends(get_admin_service),
) -> ExercisePublic:
    """Partially update an exercise via ExerciseService."""
    try:
        updated = admin_service.run_audited(
            actor_id=current_user.id,
            action=ADMIN_EXERCISE_UPDATE,
            target_type="exercise",
            operation=lambda: exercise_service.update_exercise(exercise_id, data),
        )
    except ExerciseNotFoundError as exc:
        raise _not_found("Exercise not found.") from exc
    except ExerciseAlreadyExistsError as exc:
        raise _conflict("Exercise already exists.") from exc
    except InvalidCatalogReferenceError as exc:
        raise _bad_request("Unknown muscle group or equipment reference.") from exc
    return ExercisePublic.from_model(updated)


@router.post("/exercises/{exercise_id}/deactivate", response_model=ExercisePublic)
def deactivate_admin_exercise(
    exercise_id: uuid.UUID,
    current_user: User = Depends(get_current_superuser),
    exercise_service: ExerciseService = Depends(get_exercise_service),
    admin_service: AdminService = Depends(get_admin_service),
) -> ExercisePublic:
    """Deactivate an exercise. Hard delete is not supported by ExerciseService."""
    try:
        updated = admin_service.run_audited(
            actor_id=current_user.id,
            action=ADMIN_EXERCISE_DEACTIVATE,
            target_type="exercise",
            operation=lambda: exercise_service.deactivate_exercise(exercise_id),
        )
    except ExerciseNotFoundError as exc:
        raise _not_found("Exercise not found.") from exc
    return ExercisePublic.from_model(updated)


# -- Programs --------------------------------------------------------------


@router.get("/programs", response_model=ProgramPage)
def list_admin_programs(
    program_status: ProgramStatus | None = Query(default=None, alias="status"),
    q: str | None = Query(default=None),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    _current_user: User = Depends(get_current_superuser),
    workout_service: WorkoutService = Depends(get_workout_service),
) -> ProgramPage:
    """Return a filtered, paginated page of program templates."""
    page = workout_service.list_programs(
        status=program_status, search=q, limit=limit, offset=offset
    )
    return ProgramPage(
        items=[ProgramPublic.model_validate(item) for item in page.items],
        total=page.total,
        limit=page.limit,
        offset=page.offset,
    )


@router.post("/programs", response_model=ProgramPublic, status_code=status.HTTP_201_CREATED)
def create_admin_program(
    data: ProgramCreate,
    current_user: User = Depends(get_current_superuser),
    workout_service: WorkoutService = Depends(get_workout_service),
    admin_service: AdminService = Depends(get_admin_service),
) -> ProgramPublic:
    """Create a draft program via WorkoutService."""
    try:
        created = admin_service.run_audited(
            actor_id=current_user.id,
            action=ADMIN_PROGRAM_CREATE,
            target_type="program",
            operation=lambda: workout_service.create_program(
                data, created_by_id=current_user.id
            ),
        )
    except ProgramAlreadyExistsError as exc:
        raise _conflict("Program already exists.") from exc
    return ProgramPublic.model_validate(created)


@router.get("/programs/{program_id}", response_model=AdminProgramDetail)
def get_admin_program(
    program_id: uuid.UUID,
    _current_user: User = Depends(get_current_superuser),
    workout_service: WorkoutService = Depends(get_workout_service),
) -> AdminProgramDetail:
    """Return a program with scheduled days and assignments."""
    try:
        program = workout_service.get_program(program_id, include_unpublished=True)
        days = workout_service.list_program_days(program_id)
        assignments = workout_service.list_assignments_for_program(program_id)
    except ProgramNotFoundError as exc:
        raise _not_found("Program not found.") from exc
    return AdminProgramDetail(
        program=ProgramPublic.model_validate(program),
        days=[ProgramDayRead.model_validate(day) for day in days],
        assignments=[ProgramAssignmentRead.model_validate(item) for item in assignments],
    )


@router.patch("/programs/{program_id}", response_model=ProgramPublic)
def update_admin_program(
    program_id: uuid.UUID,
    data: ProgramUpdate,
    current_user: User = Depends(get_current_superuser),
    workout_service: WorkoutService = Depends(get_workout_service),
    admin_service: AdminService = Depends(get_admin_service),
) -> ProgramPublic:
    """Partially update a program template."""
    try:
        updated = admin_service.run_audited(
            actor_id=current_user.id,
            action=ADMIN_PROGRAM_UPDATE,
            target_type="program",
            operation=lambda: workout_service.update_program(program_id, data),
        )
    except ProgramNotFoundError as exc:
        raise _not_found("Program not found.") from exc
    return ProgramPublic.model_validate(updated)


@router.post("/programs/{program_id}/publish", response_model=ProgramPublic)
def publish_admin_program(
    program_id: uuid.UUID,
    current_user: User = Depends(get_current_superuser),
    workout_service: WorkoutService = Depends(get_workout_service),
    admin_service: AdminService = Depends(get_admin_service),
) -> ProgramPublic:
    """Publish a draft program so it becomes assignable."""
    try:
        updated = admin_service.run_audited(
            actor_id=current_user.id,
            action=ADMIN_PROGRAM_PUBLISH,
            target_type="program",
            operation=lambda: workout_service.publish_program(program_id),
        )
    except ProgramNotFoundError as exc:
        raise _not_found("Program not found.") from exc
    except InvalidProgramStateError as exc:
        raise _bad_request("Program must be draft to publish.") from exc
    return ProgramPublic.model_validate(updated)


@router.post("/programs/{program_id}/archive", response_model=ProgramPublic)
def archive_admin_program(
    program_id: uuid.UUID,
    current_user: User = Depends(get_current_superuser),
    workout_service: WorkoutService = Depends(get_workout_service),
    admin_service: AdminService = Depends(get_admin_service),
) -> ProgramPublic:
    """Archive a program. Hard delete is not supported by WorkoutService."""
    try:
        updated = admin_service.run_audited(
            actor_id=current_user.id,
            action=ADMIN_PROGRAM_ARCHIVE,
            target_type="program",
            operation=lambda: workout_service.archive_program(program_id),
        )
    except ProgramNotFoundError as exc:
        raise _not_found("Program not found.") from exc
    except InvalidProgramStateError as exc:
        raise _bad_request("Program is already archived.") from exc
    return ProgramPublic.model_validate(updated)


@router.post(
    "/programs/{program_id}/days",
    response_model=ProgramDayRead,
    status_code=status.HTTP_201_CREATED,
)
def add_admin_program_day(
    program_id: uuid.UUID,
    data: ProgramDayInput,
    current_user: User = Depends(get_current_superuser),
    workout_service: WorkoutService = Depends(get_workout_service),
    admin_service: AdminService = Depends(get_admin_service),
) -> ProgramDayRead:
    """Schedule a day onto a program."""
    try:
        created = admin_service.run_audited(
            actor_id=current_user.id,
            action=ADMIN_PROGRAM_DAY_ADD,
            target_type="program_day",
            operation=lambda: workout_service.add_program_day(program_id, data),
        )
    except ProgramNotFoundError as exc:
        raise _not_found("Program not found.") from exc
    except WorkoutNotFoundError as exc:
        raise _not_found("Workout not found.") from exc
    except InvalidProgramDayError as exc:
        raise _bad_request("This program day cannot be scheduled.") from exc
    return ProgramDayRead.model_validate(created)


@router.delete(
    "/programs/{program_id}/days/{program_day_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    response_model=None,
)
def remove_admin_program_day(
    program_id: uuid.UUID,
    program_day_id: uuid.UUID,
    current_user: User = Depends(get_current_superuser),
    workout_service: WorkoutService = Depends(get_workout_service),
    admin_service: AdminService = Depends(get_admin_service),
) -> None:
    """Remove a scheduled day from a program."""
    try:
        admin_service.record_audited_delete(
            actor_id=current_user.id,
            action=ADMIN_PROGRAM_DAY_REMOVE,
            target_type="program_day",
            target_id=program_day_id,
            operation=lambda: workout_service.remove_program_day(program_id, program_day_id),
        )
    except ProgramNotFoundError as exc:
        raise _not_found("Program not found.") from exc
    except InvalidProgramDayError as exc:
        raise _not_found("Program day not found.") from exc


# -- Workout templates -----------------------------------------------------


@router.get("/workouts", response_model=WorkoutPage)
def list_admin_workouts(
    q: str | None = Query(default=None),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    _current_user: User = Depends(get_current_superuser),
    workout_service: WorkoutService = Depends(get_workout_service),
) -> WorkoutPage:
    """Return a paginated page of workout templates, including inactive rows."""
    page = workout_service.list_workouts(
        search=q, include_inactive=True, limit=limit, offset=offset
    )
    return WorkoutPage(
        items=[WorkoutPublic.from_model(item) for item in page.items],
        total=page.total,
        limit=page.limit,
        offset=page.offset,
    )


@router.post("/workouts", response_model=WorkoutPublic, status_code=status.HTTP_201_CREATED)
def create_admin_workout(
    data: WorkoutCreate,
    current_user: User = Depends(get_current_superuser),
    workout_service: WorkoutService = Depends(get_workout_service),
    admin_service: AdminService = Depends(get_admin_service),
) -> WorkoutPublic:
    """Create a workout template via WorkoutService."""
    try:
        created = admin_service.run_audited(
            actor_id=current_user.id,
            action=ADMIN_WORKOUT_CREATE,
            target_type="workout",
            operation=lambda: workout_service.create_workout(
                data, created_by_id=current_user.id
            ),
        )
    except InvalidExerciseReferenceError as exc:
        raise _bad_request("One or more exercise references are invalid.") from exc
    except WorkoutAlreadyExistsError as exc:
        raise _conflict("Workout already exists.") from exc
    return WorkoutPublic.from_model(created)


@router.get("/workouts/{workout_id}", response_model=WorkoutPublic)
def get_admin_workout(
    workout_id: uuid.UUID,
    _current_user: User = Depends(get_current_superuser),
    workout_service: WorkoutService = Depends(get_workout_service),
) -> WorkoutPublic:
    """Return a single workout template, including inactive rows."""
    try:
        workout = workout_service.get_workout(workout_id, include_inactive=True)
    except WorkoutNotFoundError as exc:
        raise _not_found("Workout not found.") from exc
    return WorkoutPublic.from_model(workout)


@router.patch("/workouts/{workout_id}", response_model=WorkoutPublic)
def update_admin_workout(
    workout_id: uuid.UUID,
    data: WorkoutUpdate,
    current_user: User = Depends(get_current_superuser),
    workout_service: WorkoutService = Depends(get_workout_service),
    admin_service: AdminService = Depends(get_admin_service),
) -> WorkoutPublic:
    """Partially update a workout template."""
    try:
        updated = admin_service.run_audited(
            actor_id=current_user.id,
            action=ADMIN_WORKOUT_UPDATE,
            target_type="workout",
            operation=lambda: workout_service.update_workout(workout_id, data),
        )
    except WorkoutNotFoundError as exc:
        raise _not_found("Workout not found.") from exc
    except InvalidExerciseReferenceError as exc:
        raise _bad_request("One or more exercise references are invalid.") from exc
    return WorkoutPublic.from_model(updated)


@router.post("/workouts/{workout_id}/deactivate", response_model=WorkoutPublic)
def deactivate_admin_workout(
    workout_id: uuid.UUID,
    current_user: User = Depends(get_current_superuser),
    workout_service: WorkoutService = Depends(get_workout_service),
    admin_service: AdminService = Depends(get_admin_service),
) -> WorkoutPublic:
    """Deactivate a workout template. Hard delete is not supported."""
    try:
        updated = admin_service.run_audited(
            actor_id=current_user.id,
            action=ADMIN_WORKOUT_DEACTIVATE,
            target_type="workout",
            operation=lambda: workout_service.deactivate_workout(workout_id),
        )
    except WorkoutNotFoundError as exc:
        raise _not_found("Workout not found.") from exc
    return WorkoutPublic.from_model(updated)


# -- Workout logs (read-only) ----------------------------------------------


@router.get("/workout-logs", response_model=AdminWorkoutLogPage)
def list_admin_workout_logs(
    user_id: uuid.UUID | None = None,
    log_status: WorkoutLogStatus | None = Query(default=None, alias="status"),
    date_from: date | None = None,
    date_to: date | None = None,
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    _current_user: User = Depends(get_current_superuser),
    workout_log_service: WorkoutLogService = Depends(get_workout_log_service),
) -> AdminWorkoutLogPage:
    """Return a filtered, paginated page of workout logs across users."""
    page = workout_log_service.list_all_logs(
        user_id=user_id,
        status=log_status,
        date_from=date_from,
        date_to=date_to,
        limit=limit,
        offset=offset,
    )
    return AdminWorkoutLogPage(
        items=[AdminWorkoutLogSummary.from_model(item) for item in page.items],
        total=page.total,
        limit=page.limit,
        offset=page.offset,
    )


@router.get("/workout-logs/{workout_log_id}", response_model=WorkoutLogDetail)
def get_admin_workout_log(
    workout_log_id: uuid.UUID,
    _current_user: User = Depends(get_current_superuser),
    workout_log_service: WorkoutLogService = Depends(get_workout_log_service),
) -> WorkoutLogDetail:
    """Return a single workout log with exercises and sets."""
    try:
        workout_log = workout_log_service.get_any_workout_log(workout_log_id)
    except WorkoutLogNotFoundError as exc:
        raise _not_found("Workout log not found.") from exc
    return WorkoutLogDetail.from_model(workout_log)


# -- Nutrition (read-only) -------------------------------------------------


@router.get("/meals", response_model=MealPage)
def list_admin_meals(
    created_by_id: uuid.UUID | None = None,
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    _current_user: User = Depends(get_current_superuser),
    nutrition_service: NutritionService = Depends(get_nutrition_service),
) -> MealPage:
    """Return a paginated page of meal templates across users."""
    page = nutrition_service.list_all_meals(
        created_by_id=created_by_id, include_inactive=True, limit=limit, offset=offset
    )
    return MealPage(
        items=[MealRead.from_model(item) for item in page.items],
        total=page.total,
        limit=page.limit,
        offset=page.offset,
    )


@router.get("/meals/{meal_id}", response_model=MealRead)
def get_admin_meal(
    meal_id: uuid.UUID,
    _current_user: User = Depends(get_current_superuser),
    nutrition_service: NutritionService = Depends(get_nutrition_service),
) -> MealRead:
    """Return a single meal template."""
    try:
        meal = nutrition_service.get_any_meal(meal_id)
    except MealNotFoundError as exc:
        raise _not_found("Meal not found.") from exc
    return MealRead.from_model(meal)


@router.get("/meal-logs", response_model=MealLogPage)
def list_admin_meal_logs(
    user_id: uuid.UUID | None = None,
    date_from: date | None = None,
    date_to: date | None = None,
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    _current_user: User = Depends(get_current_superuser),
    nutrition_service: NutritionService = Depends(get_nutrition_service),
) -> MealLogPage:
    """Return a filtered, paginated page of meal logs across users."""
    page = nutrition_service.list_all_meal_logs(
        user_id=user_id, date_from=date_from, date_to=date_to, limit=limit, offset=offset
    )
    return MealLogPage(
        items=[MealLogRead.from_model(item) for item in page.items],
        total=page.total,
        limit=page.limit,
        offset=page.offset,
    )


@router.get("/meal-logs/{meal_log_id}", response_model=MealLogRead)
def get_admin_meal_log(
    meal_log_id: uuid.UUID,
    _current_user: User = Depends(get_current_superuser),
    nutrition_service: NutritionService = Depends(get_nutrition_service),
) -> MealLogRead:
    """Return a single meal log."""
    try:
        meal_log = nutrition_service.get_any_meal_log(meal_log_id)
    except MealLogNotFoundError as exc:
        raise _not_found("Meal log not found.") from exc
    return MealLogRead.from_model(meal_log)


@router.get("/nutrition/targets", response_model=DailyNutritionRead)
def get_admin_nutrition_targets(
    user_id: uuid.UUID,
    for_date: date | None = Query(default=None),
    _current_user: User = Depends(get_current_superuser),
    nutrition_service: NutritionService = Depends(get_nutrition_service),
) -> DailyNutritionRead:
    """Return daily nutrition targets for a specific user via NutritionService."""
    try:
        output = nutrition_service.get_daily_nutrition(user_id, for_date=for_date)
    except MealNotFoundError as exc:
        raise _not_found("User not found.") from exc
    except IncompleteNutritionProfileError as exc:
        raise _unprocessable("Nutrition profile is incomplete.") from exc
    return DailyNutritionRead.from_output(output)


# -- Recovery (read-only) --------------------------------------------------


@router.get("/recovery/check-ins", response_model=RecoveryCheckInPage)
def list_admin_check_ins(
    user_id: uuid.UUID | None = None,
    date_from: date | None = None,
    date_to: date | None = None,
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    _current_user: User = Depends(get_current_superuser),
    recovery_service: RecoveryService = Depends(get_recovery_service),
) -> RecoveryCheckInPage:
    """Return a filtered, paginated page of recovery check-ins across users."""
    page = recovery_service.list_all_check_ins(
        user_id=user_id, date_from=date_from, date_to=date_to, limit=limit, offset=offset
    )
    return RecoveryCheckInPage(
        items=[RecoveryCheckInRead.from_model(item) for item in page.items],
        total=page.total,
        limit=page.limit,
        offset=page.offset,
    )


@router.get("/recovery/check-ins/{check_in_id}", response_model=RecoveryCheckInRead)
def get_admin_check_in(
    check_in_id: uuid.UUID,
    _current_user: User = Depends(get_current_superuser),
    recovery_service: RecoveryService = Depends(get_recovery_service),
) -> RecoveryCheckInRead:
    """Return a single recovery check-in."""
    try:
        check_in = recovery_service.get_any_check_in(check_in_id)
    except CheckInNotFoundError as exc:
        raise _not_found("Check-in not found.") from exc
    return RecoveryCheckInRead.from_model(check_in)


@router.get("/recovery/readiness", response_model=ReadinessRead)
def get_admin_readiness(
    user_id: uuid.UUID,
    for_date: date | None = Query(default=None),
    _current_user: User = Depends(get_current_superuser),
    recovery_service: RecoveryService = Depends(get_recovery_service),
) -> ReadinessRead:
    """Return daily readiness for a specific user via RecoveryService."""
    try:
        output = recovery_service.get_daily_readiness(user_id, for_date=for_date)
    except CheckInNotFoundError as exc:
        raise _not_found("No check-in found for that date.") from exc
    return ReadinessRead.from_output(output)


# -- Goals / progress (read-only) ------------------------------------------


@router.get("/goals", response_model=GoalPage)
def list_admin_goals(
    user_id: uuid.UUID | None = None,
    goal_status: GoalStatus | None = Query(default=None, alias="status"),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    _current_user: User = Depends(get_current_superuser),
    goal_service: GoalService = Depends(get_goal_service),
) -> GoalPage:
    """Return a filtered, paginated page of goals across users."""
    page = goal_service.list_all_goals(
        user_id=user_id, status=goal_status, limit=limit, offset=offset
    )
    return GoalPage(
        items=[GoalRead.from_model(item) for item in page.items],
        total=page.total,
        limit=page.limit,
        offset=page.offset,
    )


@router.get("/goals/{goal_id}", response_model=GoalRead)
def get_admin_goal(
    goal_id: uuid.UUID,
    _current_user: User = Depends(get_current_superuser),
    goal_service: GoalService = Depends(get_goal_service),
) -> GoalRead:
    """Return a single goal."""
    try:
        goal = goal_service.get_any_goal(goal_id)
    except GoalNotFoundError as exc:
        raise _not_found("Goal not found.") from exc
    return GoalRead.from_model(goal)


@router.get("/progress", response_model=ProgressEntryPage)
def list_admin_progress(
    user_id: uuid.UUID | None = None,
    metric_type: ProgressMetricType | None = None,
    goal_id: uuid.UUID | None = None,
    date_from: date | None = None,
    date_to: date | None = None,
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    _current_user: User = Depends(get_current_superuser),
    progress_service: ProgressService = Depends(get_progress_service),
) -> ProgressEntryPage:
    """Return a filtered, paginated page of progress entries across users."""
    page = progress_service.list_all_progress(
        user_id=user_id,
        metric_type=metric_type,
        goal_id=goal_id,
        date_from=date_from,
        date_to=date_to,
        limit=limit,
        offset=offset,
    )
    return ProgressEntryPage(
        items=[ProgressEntryRead.from_model(item) for item in page.items],
        total=page.total,
        limit=page.limit,
        offset=page.offset,
    )


@router.get("/progress/summary", response_model=ProgressSummaryRead)
async def get_admin_progress_summary(
    user_id: uuid.UUID,
    metric_type: ProgressMetricType,
    goal_id: uuid.UUID | None = None,
    date_from: date | None = None,
    date_to: date | None = None,
    _current_user: User = Depends(get_current_superuser),
    progress_service: ProgressService = Depends(get_progress_service),
) -> ProgressSummaryRead:
    """Return a progress summary for a specific user via ProgressService."""
    try:
        output, window_start, window_end, unit = await progress_service.get_progress_summary(
            user_id,
            metric_type,
            goal_id=goal_id,
            date_from=date_from,
            date_to=date_to,
        )
    except InvalidProgressReferenceError as exc:
        raise _bad_request("Goal not found.") from exc
    except InsufficientProgressDataError as exc:
        raise _unprocessable("Not enough progress data to compute a summary.") from exc
    return ProgressSummaryRead.from_output(
        output,
        metric_type=metric_type,
        unit=unit,
        window_start=window_start,
        window_end=window_end,
    )


@router.get("/progress/{entry_id}", response_model=ProgressEntryRead)
def get_admin_progress_entry(
    entry_id: uuid.UUID,
    _current_user: User = Depends(get_current_superuser),
    progress_service: ProgressService = Depends(get_progress_service),
) -> ProgressEntryRead:
    """Return a single progress entry."""
    try:
        entry = progress_service.get_any_progress_entry(entry_id)
    except ProgressEntryNotFoundError as exc:
        raise _not_found("Progress entry not found.") from exc
    return ProgressEntryRead.from_model(entry)


# -- Coach (read-only) -----------------------------------------------------


@router.get("/conversations", response_model=AdminConversationPage)
def list_admin_conversations(
    user_id: uuid.UUID | None = None,
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    _current_user: User = Depends(get_current_superuser),
    coach_service: CoachService = Depends(get_coach_service),
) -> AdminConversationPage:
    """Return a paginated page of Coach conversations across users."""
    page = coach_service.list_all_conversations(user_id=user_id, limit=limit, offset=offset)
    return AdminConversationPage(
        items=[AdminConversationRead.model_validate(item) for item in page.items],
        total=page.total,
        limit=page.limit,
        offset=page.offset,
    )


@router.get("/conversations/{conversation_id}", response_model=AdminConversationRead)
def get_admin_conversation(
    conversation_id: uuid.UUID,
    _current_user: User = Depends(get_current_superuser),
    coach_service: CoachService = Depends(get_coach_service),
) -> AdminConversationRead:
    """Return a single Coach conversation."""
    try:
        conversation = coach_service.get_any_conversation(conversation_id)
    except ConversationAccessDeniedError as exc:
        raise _not_found("Conversation not found.") from exc
    return AdminConversationRead.model_validate(conversation)


@router.get("/conversations/{conversation_id}/messages", response_model=ChatMessagePage)
def list_admin_conversation_messages(
    conversation_id: uuid.UUID,
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    _current_user: User = Depends(get_current_superuser),
    coach_service: CoachService = Depends(get_coach_service),
) -> ChatMessagePage:
    """Return a paginated page of messages for a conversation."""
    try:
        page = coach_service.get_any_conversation_history(
            conversation_id, limit=limit, offset=offset
        )
    except ConversationAccessDeniedError as exc:
        raise _not_found("Conversation not found.") from exc
    return ChatMessagePage(
        items=[ChatMessageRead.from_model(item) for item in page.items],
        total=page.total,
        limit=page.limit,
        offset=page.offset,
    )

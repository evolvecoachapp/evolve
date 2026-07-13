"""Unit tests for :class:`~app.services.goal_service.GoalService`.

The injected :class:`~app.repositories.goal_repository.GoalRepository` is
mocked throughout — these tests exercise goal CRUD, ownership checks, and
status/priority transitions in isolation, with no database involved. See
``tests/integration/test_goals_api.py`` for a full end-to-end flow against a
real PostgreSQL instance.
"""

import uuid
from datetime import date, datetime, timezone

import pytest

from app.models.goal import Goal, GoalPriority, GoalStatus, GoalType
from app.schemas.goal import GoalCreate, GoalUpdate
from app.services.goal_service import GoalNotFoundError, GoalService

USER_ID = uuid.uuid4()
OTHER_USER_ID = uuid.uuid4()


@pytest.fixture()
def goal_repository(mocker):
    repo = mocker.Mock()
    repo.db = mocker.Mock()
    return repo


@pytest.fixture()
def service(goal_repository) -> GoalService:
    return GoalService(goal_repository)


def _make_goal(
    *,
    goal_id: uuid.UUID | None = None,
    user_id: uuid.UUID = USER_ID,
    status: GoalStatus = GoalStatus.ACTIVE,
    deleted_at: datetime | None = None,
) -> Goal:
    return Goal(
        id=goal_id or uuid.uuid4(),
        user_id=user_id,
        goal_type=GoalType.WEIGHT_TARGET,
        description="Lose 5kg",
        start_date=date(2026, 1, 1),
        status=status,
        priority=GoalPriority.MEDIUM,
        created_at=datetime(2026, 1, 1, tzinfo=timezone.utc),
        deleted_at=deleted_at,
    )


def test_create_goal_persists_a_new_goal(service, goal_repository):
    goal_repository.create.side_effect = lambda goal: goal
    data = GoalCreate(
        goal_type=GoalType.WEIGHT_TARGET,
        description="Lose 5kg",
        start_date=date(2026, 1, 1),
    )

    created = service.create_goal(USER_ID, data)

    assert created.user_id == USER_ID
    assert created.status == GoalStatus.ACTIVE
    goal_repository.db.commit.assert_called_once()


def test_update_goal_raises_when_not_owned_by_caller(service, goal_repository):
    goal_repository.get_by_id.return_value = _make_goal(user_id=OTHER_USER_ID)

    with pytest.raises(GoalNotFoundError):
        service.update_goal(USER_ID, uuid.uuid4(), GoalUpdate(status=GoalStatus.ACHIEVED))


def test_update_goal_raises_when_soft_deleted(service, goal_repository):
    goal_repository.get_by_id.return_value = _make_goal(deleted_at=datetime.now(timezone.utc))

    with pytest.raises(GoalNotFoundError):
        service.update_goal(USER_ID, uuid.uuid4(), GoalUpdate(status=GoalStatus.ACHIEVED))


def test_update_goal_applies_a_status_transition(service, goal_repository):
    goal = _make_goal()
    goal_repository.get_by_id.return_value = goal
    goal_repository.update.side_effect = lambda g: g

    updated = service.update_goal(USER_ID, goal.id, GoalUpdate(status=GoalStatus.ACHIEVED))

    assert updated.status == GoalStatus.ACHIEVED
    goal_repository.db.commit.assert_called_once()


def test_update_goal_applies_a_priority_change(service, goal_repository):
    goal = _make_goal()
    goal_repository.get_by_id.return_value = goal
    goal_repository.update.side_effect = lambda g: g

    updated = service.update_goal(USER_ID, goal.id, GoalUpdate(priority=GoalPriority.HIGH))

    assert updated.priority == GoalPriority.HIGH


def test_get_goal_not_found_when_soft_deleted(service, goal_repository):
    goal_repository.get_by_id.return_value = _make_goal(deleted_at=datetime.now(timezone.utc))

    with pytest.raises(GoalNotFoundError):
        service.get_goal(USER_ID, uuid.uuid4())


def test_get_goal_returns_the_goal_when_owned(service, goal_repository):
    goal = _make_goal()
    goal_repository.get_by_id.return_value = goal

    result = service.get_goal(USER_ID, goal.id)

    assert result is goal


def test_delete_goal_soft_deletes_when_owned(service, goal_repository):
    goal = _make_goal()
    goal_repository.get_by_id.return_value = goal

    service.delete_goal(USER_ID, goal.id)

    goal_repository.delete.assert_called_once_with(goal)
    goal_repository.db.commit.assert_called_once()


def test_delete_goal_raises_when_not_owned_by_caller(service, goal_repository):
    goal_repository.get_by_id.return_value = _make_goal(user_id=OTHER_USER_ID)

    with pytest.raises(GoalNotFoundError):
        service.delete_goal(USER_ID, uuid.uuid4())


def test_list_goals_delegates_to_the_repository_with_clamped_pagination(
    service, goal_repository
):
    goal_repository.list_for_user.return_value = [_make_goal()]
    goal_repository.count.return_value = 1

    page = service.list_goals(USER_ID, status=GoalStatus.ACTIVE, limit=500, offset=-5)

    assert page.total == 1
    _, kwargs = goal_repository.list_for_user.call_args
    assert kwargs["status"] == GoalStatus.ACTIVE
    assert kwargs["limit"] <= 100
    assert kwargs["offset"] == 0

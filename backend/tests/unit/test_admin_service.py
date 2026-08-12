"""Unit tests for :class:`~app.services.admin_service.AdminService`.

Repositories and UserService are mocked — these tests exercise dashboard
composition, health sanitization, and audited account-status delegation.
"""

import uuid

import pytest

from app.models.admin_audit_log import AdminAuditResult
from app.models.user import User
from app.services.admin_service import (
    ADMIN_SESSION_START,
    ADMIN_USER_SET_STATUS,
    AdminService,
)
from app.services.user_service import UserNotFoundError

ACTOR_ID = uuid.uuid4()
USER_ID = uuid.uuid4()


@pytest.fixture()
def user_service(mocker):
    return mocker.Mock()


@pytest.fixture()
def audit_repository(mocker):
    repo = mocker.Mock()
    repo.db = mocker.Mock()
    return repo


@pytest.fixture()
def service(mocker, user_service, audit_repository) -> AdminService:
    db = mocker.Mock()
    return AdminService(
        db,
        user_service,
        audit_repository,
        mocker.Mock(),
        mocker.Mock(),
        mocker.Mock(),
        mocker.Mock(),
        mocker.Mock(),
        mocker.Mock(),
    )


def test_get_dashboard_summary_composes_user_and_activity_counts(service, user_service):
    user_service.count_users.return_value = {
        "total": 4,
        "active": 3,
        "inactive": 1,
        "superusers": 1,
    }
    service.workout_log_repository.count_all.return_value = 10
    service.meal_repository.count_all_logs.return_value = 5
    service.recovery_repository.count_all.return_value = 2
    service.goal_repository.count_all.return_value = 7
    service.progress_repository.count_all.return_value = 3
    service.chat_repository.count_conversations.return_value = 1

    summary = service.get_dashboard_summary()

    assert summary.users["total"] == 4
    assert summary.activity["workout_logs"] == 10
    assert summary.activity["conversations"] == 1


def test_get_system_health_ok_when_db_pings(service):
    health = service.get_system_health()

    assert health.status == "ok"
    assert health.api == "online"
    assert health.database == "connected"
    service.db.execute.assert_called_once()


def test_get_system_health_degraded_without_raw_error(service):
    service.db.execute.side_effect = RuntimeError("connection refused to host secret")

    health = service.get_system_health()

    assert health.status == "degraded"
    assert health.database == "unavailable"
    assert "secret" not in health.status
    assert "connection refused" not in health.database


def test_start_session_writes_audit(service, audit_repository):
    actor = User(id=ACTOR_ID, email="admin@evolve.app", username="admin")

    result = service.start_session(actor)

    assert result is actor
    audit_repository.create.assert_called_once()
    kwargs = audit_repository.create.call_args.kwargs
    assert kwargs["actor_id"] == ACTOR_ID
    assert kwargs["action"] == ADMIN_SESSION_START
    assert kwargs["result"] == AdminAuditResult.SUCCESS
    audit_repository.db.commit.assert_called_once()


def test_set_user_account_status_delegates_and_audits_success(
    service, user_service, audit_repository
):
    updated = User(id=USER_ID, email="user@evolve.app", username="user", is_active=False)
    user_service.set_account_status.return_value = updated

    result = service.set_user_account_status(ACTOR_ID, USER_ID, is_active=False)

    assert result is updated
    user_service.set_account_status.assert_called_once_with(USER_ID, is_active=False)
    kwargs = audit_repository.create.call_args.kwargs
    assert kwargs["action"] == ADMIN_USER_SET_STATUS
    assert kwargs["result"] == AdminAuditResult.SUCCESS
    assert kwargs["target_id"] == USER_ID


def test_set_user_account_status_audits_failure(service, user_service, audit_repository):
    user_service.set_account_status.side_effect = UserNotFoundError("User not found.")

    with pytest.raises(UserNotFoundError):
        service.set_user_account_status(ACTOR_ID, USER_ID, is_active=False)

    kwargs = audit_repository.create.call_args.kwargs
    assert kwargs["result"] == AdminAuditResult.FAILURE


def test_run_audited_records_success_with_target_id(service, audit_repository):
    class Result:
        id = USER_ID

    result = service.run_audited(
        actor_id=ACTOR_ID,
        action="admin.exercise.create",
        target_type="exercise",
        operation=lambda: Result(),
    )

    assert result.id == USER_ID
    kwargs = audit_repository.create.call_args.kwargs
    assert kwargs["action"] == "admin.exercise.create"
    assert kwargs["result"] == AdminAuditResult.SUCCESS
    assert kwargs["target_id"] == USER_ID


def test_run_audited_records_failure_and_reraises(service, audit_repository):
    with pytest.raises(ValueError, match="boom"):
        service.run_audited(
            actor_id=ACTOR_ID,
            action="admin.exercise.update",
            target_type="exercise",
            operation=lambda: (_ for _ in ()).throw(ValueError("boom")),
        )

    kwargs = audit_repository.create.call_args.kwargs
    assert kwargs["result"] == AdminAuditResult.FAILURE
    assert kwargs["target_type"] == "exercise"


def test_record_audited_delete_records_success(service, audit_repository):
    service.record_audited_delete(
        actor_id=ACTOR_ID,
        action="admin.program.day.remove",
        target_type="program_day",
        target_id=USER_ID,
        operation=lambda: None,
    )

    kwargs = audit_repository.create.call_args.kwargs
    assert kwargs["action"] == "admin.program.day.remove"
    assert kwargs["result"] == AdminAuditResult.SUCCESS
    assert kwargs["target_id"] == USER_ID

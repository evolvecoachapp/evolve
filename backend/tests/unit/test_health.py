"""Unit tests for public deployment health checks."""

from app.core.health import check_system_health


def test_check_system_health_ok_when_db_pings(mocker):
    mocker.patch("app.core.health.ping_database", return_value=True)

    snapshot = check_system_health()

    assert snapshot.status == "ok"
    assert snapshot.api == "online"
    assert snapshot.database == "connected"
    assert snapshot.is_ok is True
    assert "secret" not in snapshot.status
    assert "traceback" not in snapshot.database


def test_check_system_health_degraded_without_raw_error(mocker):
    mocker.patch("app.core.health.ping_database", return_value=False)

    snapshot = check_system_health()

    assert snapshot.status == "degraded"
    assert snapshot.database == "unavailable"
    assert snapshot.is_ok is False
    assert "secret" not in snapshot.status
    assert "exception" not in snapshot.database


def test_ping_database_failure_is_sanitized(mocker):
    connect = mocker.patch("app.core.health.engine.connect")
    connect.side_effect = RuntimeError("connection refused to host secret")

    from app.core.health import ping_database

    assert ping_database() is False

"""Shared pytest fixtures for the EVOLVE backend test suite.

Unit tests (``tests/unit/``) exercise services with mocked repositories and
never touch this module's database fixtures. Integration tests
(``tests/integration/``) run against the real PostgreSQL instance
configured by ``DATABASE_URL`` (the same one ``docker-compose.yml`` starts
for local development) — there is no separate test database. Isolation is
achieved by running each test inside an outer transaction that is always
rolled back, using SQLAlchemy's documented "join a session into an external
transaction" pattern so this works even though the code under test calls
``Session.commit()`` internally (each such commit ends a ``SAVEPOINT``, not
the outer transaction; a listener immediately reopens a new ``SAVEPOINT``).
"""

import uuid
from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import settings
from app.db.database import get_db
from app.main import app
from app.models.user import User
from app.security.hashing import hash_password
from app.security.jwt import create_access_token

_engine = create_engine(settings.database_url, pool_pre_ping=True)
_TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=_engine)


@pytest.fixture()
def db_session() -> Generator[Session, None, None]:
    """Yield a session whose writes (including internal commits) are always rolled back.

    ``Session.commit()`` calls made by code under test end the current
    ``SAVEPOINT``, not the outer transaction, because the session is bound
    to a connection that already has an outer transaction in progress —
    the ``after_transaction_end`` listener immediately reopens a fresh
    ``SAVEPOINT`` so subsequent writes in the same test still nest inside
    the outer, never-committed transaction.
    """
    connection = _engine.connect()
    outer_transaction = connection.begin()
    session = _TestSessionLocal(bind=connection)
    nested = connection.begin_nested()

    @event.listens_for(session, "after_transaction_end")
    def _restart_savepoint(sess: Session, transaction) -> None:
        nonlocal nested
        if not nested.is_active:
            nested = connection.begin_nested()

    try:
        yield session
    finally:
        event.remove(session, "after_transaction_end", _restart_savepoint)
        session.close()
        outer_transaction.rollback()
        connection.close()


@pytest.fixture()
def test_user(db_session: Session) -> User:
    """Create and persist a single active user for use by other fixtures/tests."""
    user = User(
        email=f"{uuid.uuid4().hex}@example.com",
        username=f"user_{uuid.uuid4().hex[:12]}",
        hashed_password=hash_password("Sprint3.3-Testing!"),
        is_active=True,
        is_verified=True,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture()
def other_user(db_session: Session) -> User:
    """Create and persist a second active user, distinct from :func:`test_user`.

    Used to exercise ownership checks (a user must never be able to act on
    another user's workout log).
    """
    user = User(
        email=f"{uuid.uuid4().hex}@example.com",
        username=f"user_{uuid.uuid4().hex[:12]}",
        hashed_password=hash_password("Sprint3.3-Testing!"),
        is_active=True,
        is_verified=True,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture()
def auth_headers(test_user: User) -> dict[str, str]:
    """Return an ``Authorization`` header carrying a valid access token for :func:`test_user`."""
    token = create_access_token(test_user.id)
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture()
def client(db_session: Session) -> Generator[TestClient, None, None]:
    """Yield a :class:`TestClient` with ``get_db`` overridden to the isolated test session.

    Every request made through this client — including ones triggered by
    real dependency chains like ``get_current_user`` — reads and writes
    through the same rolled-back-at-teardown session as :func:`db_session`.
    """
    app.dependency_overrides[get_db] = lambda: db_session
    try:
        yield TestClient(app)
    finally:
        app.dependency_overrides.pop(get_db, None)

"""Integration test for the Coach API, end to end.

Runs against the real PostgreSQL instance (see ``tests/conftest.py`` for the
transaction-rollback isolation strategy) through FastAPI's ``TestClient``,
exercising the actual router -> ``CoachService`` -> ``AIOrchestrator`` ->
engine adapter / ``MemoryEngine`` -> repository -> database stack end to
end: intent routing to each of the three Sprint 4.5 engine adapters
(including their graceful-degradation paths, since ``test_user`` has no
active program, no complete nutrition profile, and no check-in yet), the
mock-LLM fallback for an unmatched message, conversation persistence/
resumption, and cross-user ownership enforcement. Mirrors
``test_recovery_api.py``/``test_chat_persistence.py``.

``test_posted_conversation_survives_a_closed_request_session`` does **not**
use the shared ``client`` fixture: that fixture reuses one Session across
requests, so a ``flush()`` is still visible to a later GET without a
commit. The production ``get_db`` closes the session after each request,
which rolls back uncommitted work.
"""

import uuid
from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.db.database import engine, get_db
from app.main import app
from app.models.user import User
from app.security.hashing import hash_password
from app.security.jwt import create_access_token

API_PREFIX = "/api/v1/coach"


@pytest.fixture()
def per_request_client() -> Generator[tuple[TestClient, dict[str, str]], None, None]:
    """Yield a TestClient whose ``get_db`` matches production session lifetime.

    Each request gets a new :class:`~sqlalchemy.orm.Session` that is closed
    afterwards. Sessions join one outer connection transaction via
    ``create_savepoint``, so ``Session.commit()`` is visible to the next
    request while teardown still rolls back.
    """
    connection = engine.connect()
    outer = connection.begin()
    seed = Session(bind=connection, join_transaction_mode="create_savepoint")
    user = User(
        email=f"{uuid.uuid4().hex}@example.com",
        username=f"user_{uuid.uuid4().hex[:12]}",
        hashed_password=hash_password("Sprint3.3-Testing!"),
        is_active=True,
        is_verified=True,
    )
    seed.add(user)
    seed.commit()
    seed.refresh(user)
    user_id = user.id
    seed.close()

    def _get_db() -> Generator[Session, None, None]:
        session = Session(bind=connection, join_transaction_mode="create_savepoint")
        try:
            yield session
        finally:
            session.close()

    previous = app.dependency_overrides.pop(get_db, None)
    app.dependency_overrides[get_db] = _get_db
    headers = {"Authorization": f"Bearer {create_access_token(user_id)}"}
    try:
        yield TestClient(app), headers
    finally:
        app.dependency_overrides.pop(get_db, None)
        if previous is not None:
            app.dependency_overrides[get_db] = previous
        outer.rollback()
        connection.close()


def _send(client: TestClient, headers: dict[str, str], message: str, **extra) -> dict:
    response = client.post(
        f"{API_PREFIX}/messages", json={"message": message, **extra}, headers=headers
    )
    assert response.status_code == 200, response.text
    return response.json()


def test_general_message_falls_back_to_the_mock_llm(
    client: TestClient, auth_headers: dict[str, str]
) -> None:
    body = _send(client, auth_headers, "How's it going?")

    assert body["intent"] == "general"
    assert body["engines_invoked"] == []
    assert body["artifacts"] is None
    assert "mock LLM provider" in body["message"]


def test_workout_intent_routes_to_the_workout_engine_with_no_active_program(
    client: TestClient, auth_headers: dict[str, str]
) -> None:
    body = _send(client, auth_headers, "What's my workout today?")

    assert body["intent"] == "workout"
    assert body["engines_invoked"] == ["workout_coach_engine"]
    assert "active program" in body["message"]
    assert body["artifacts"]["state"] == "no_active_program"


def test_nutrition_intent_degrades_gracefully_without_a_complete_profile(
    client: TestClient, auth_headers: dict[str, str]
) -> None:
    body = _send(client, auth_headers, "What should I eat today?")

    assert body["intent"] == "nutrition"
    assert body["engines_invoked"] == ["nutrition_coach_engine"]
    assert body["artifacts"] is None
    assert "nutrition targets" in body["message"]


def test_recovery_intent_degrades_gracefully_without_a_check_in(
    client: TestClient, auth_headers: dict[str, str]
) -> None:
    body = _send(client, auth_headers, "I'm feeling sore, should I rest today?")

    assert body["intent"] == "recovery"
    assert body["engines_invoked"] == ["recovery_coach_engine"]
    assert body["artifacts"] is None
    assert "check-in" in body["message"].lower()


def test_conversation_persists_and_resumes_across_messages_and_is_readable(
    client: TestClient, auth_headers: dict[str, str]
) -> None:
    first = _send(client, auth_headers, "How's it going?")
    second = _send(client, auth_headers, "Still doing fine, thanks")

    assert second["conversation_id"] == first["conversation_id"]

    history_response = client.get(
        f"{API_PREFIX}/conversations/{first['conversation_id']}/messages", headers=auth_headers
    )
    assert history_response.status_code == 200, history_response.text
    history = history_response.json()
    assert history["total"] == 4
    assert [message["content"] for message in history["items"]] == [
        "How's it going?",
        first["message"],
        "Still doing fine, thanks",
        second["message"],
    ]
    assert [message["role"] for message in history["items"]] == [
        "user",
        "assistant",
        "user",
        "assistant",
    ]


def test_explicit_unknown_conversation_id_is_rejected(
    client: TestClient, auth_headers: dict[str, str]
) -> None:
    """A conversation_id that does not resolve to any conversation is treated as not-owned.

    Unlike ``AIOrchestrator.process_message`` called directly (which starts
    a fresh, separate conversation under a *new* id when given an unknown
    one — see ``test_chat_persistence.py``), ``CoachService``'s ownership
    check (Decision 019) rejects it outright: since a client-supplied id is
    never actually reused as the new conversation's id, there is no
    legitimate reason for a client to reference an id it hasn't already
    received back from this API.
    """
    unknown_id = str(uuid.uuid4())
    response = client.post(
        f"{API_PREFIX}/messages",
        json={"message": "hello", "conversation_id": unknown_id},
        headers=auth_headers,
    )
    assert response.status_code == 404


def test_conversation_not_accessible_to_other_users(
    client: TestClient, auth_headers: dict[str, str], other_user: User
) -> None:
    owner_response = _send(client, auth_headers, "hello")
    conversation_id = owner_response["conversation_id"]
    other_headers = {"Authorization": f"Bearer {create_access_token(other_user.id)}"}

    forbidden_send = client.post(
        f"{API_PREFIX}/messages",
        json={"message": "trying to hijack", "conversation_id": conversation_id},
        headers=other_headers,
    )
    assert forbidden_send.status_code == 404

    forbidden_history = client.get(
        f"{API_PREFIX}/conversations/{conversation_id}/messages", headers=other_headers
    )
    assert forbidden_history.status_code == 404


def test_unauthenticated_request_is_rejected(client: TestClient) -> None:
    response = client.post(f"{API_PREFIX}/messages", json={"message": "hello"})
    assert response.status_code in (401, 403)


def test_posted_conversation_survives_a_closed_request_session(
    per_request_client: tuple[TestClient, dict[str, str]],
) -> None:
    """POST must commit so a later request can read and resume the conversation.

    Uses :func:`per_request_client` so each HTTP call closes its session,
    matching production ``get_db``. A flush-only send would 200 and then 404
    on history and on a follow-up POST with the returned id.
    """
    client, headers = per_request_client

    first = _send(client, headers, "How's it going?")
    conversation_id = first["conversation_id"]

    history_response = client.get(
        f"{API_PREFIX}/conversations/{conversation_id}/messages", headers=headers
    )
    assert history_response.status_code == 200, history_response.text
    history = history_response.json()
    assert history["total"] == 2
    assert [message["content"] for message in history["items"]] == [
        "How's it going?",
        first["message"],
    ]
    assert [message["role"] for message in history["items"]] == ["user", "assistant"]

    second = _send(
        client, headers, "Still doing fine, thanks", conversation_id=conversation_id
    )
    assert second["conversation_id"] == conversation_id

    resumed = client.get(
        f"{API_PREFIX}/conversations/{conversation_id}/messages", headers=headers
    )
    assert resumed.status_code == 200, resumed.text
    assert resumed.json()["total"] == 4

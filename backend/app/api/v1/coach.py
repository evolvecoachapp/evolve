"""Coach routes — the conversational entrypoint to the AI Orchestrator.

Routes stay thin: parse/validate input, delegate to
:class:`~app.services.coach_service.CoachService`, and translate its
documented exceptions into HTTP responses. No orchestration, intent
routing, or persistence logic happens in this module — all of that lives
inside :class:`~app.ai.orchestrator.AIOrchestrator`/
:class:`~app.ai.memory_engine.MemoryEngine`.

Every route requires an authenticated user (``Depends(get_current_user)``);
``user_id`` is always taken from the resolved token, never from the request
body or path, mirroring ``recovery.py``/``nutrition.py``. ``send_message``
is the one ``async def`` route in the API layer, matching
``AIOrchestrator.process_message`` being the one ``async def`` in the
backend (Decision 009 in ``docs/DECISIONS.md``).
"""

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.dependencies import get_coach_service
from app.models.user import User
from app.schemas.coach import ChatMessagePage, ChatMessageRead, CoachMessageCreate, CoachMessageRead
from app.security.dependencies import get_current_user
from app.services.coach_service import CoachService, ConversationAccessDeniedError

router = APIRouter(prefix="/coach", tags=["coach"])


def _not_found(detail: str) -> HTTPException:
    return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=detail)


@router.post("/messages", response_model=CoachMessageRead, status_code=status.HTTP_200_OK)
async def send_message(
    data: CoachMessageCreate,
    current_user: User = Depends(get_current_user),
    coach_service: CoachService = Depends(get_coach_service),
) -> CoachMessageRead:
    """Send one message to the Coach and return its synthesized reply.

    If ``conversation_id`` is omitted, the current user's most recently
    active conversation is resumed (or a new one is started if they have
    none yet). If ``conversation_id`` is given but unknown, a new
    conversation is started under that id.

    Raises:
        HTTPException: 404 if ``conversation_id`` is given but resolves to
            a conversation not owned by the current user.
    """
    try:
        response = await coach_service.send_message(
            current_user.id, data.message, data.conversation_id
        )
    except ConversationAccessDeniedError as exc:
        raise _not_found(str(exc)) from exc
    return CoachMessageRead.from_response(response)


@router.get(
    "/conversations/{conversation_id}/messages",
    response_model=ChatMessagePage,
)
def get_conversation_history(
    conversation_id: uuid.UUID,
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    current_user: User = Depends(get_current_user),
    coach_service: CoachService = Depends(get_coach_service),
) -> ChatMessagePage:
    """Return a paginated page of one conversation's messages, oldest first.

    Raises:
        HTTPException: 404 if ``conversation_id`` doesn't exist or isn't
            owned by the current user.
    """
    try:
        page = coach_service.get_conversation_history(
            current_user.id, conversation_id, limit=limit, offset=offset
        )
    except ConversationAccessDeniedError as exc:
        raise _not_found(str(exc)) from exc
    return ChatMessagePage(
        items=[ChatMessageRead.from_model(message) for message in page.items],
        total=page.total,
        limit=page.limit,
        offset=page.offset,
    )

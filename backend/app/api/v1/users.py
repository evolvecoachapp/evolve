"""User routes — profile retrieval and update for the authenticated caller.

Routes stay thin: authentication is fully resolved by the
``get_current_user`` dependency before the handler body runs. Business logic
is delegated to :class:`~app.services.user_service.UserService`; no database
queries or JWT handling happens in this module.
"""

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.dependencies import get_user_service
from app.models.user import User
from app.schemas.user import UserPublic, UserUpdate
from app.security.dependencies import get_current_user
from app.services.auth_service import UserAlreadyExistsError
from app.services.user_service import UserNotFoundError, UserService

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserPublic)
def get_me(current_user: User = Depends(get_current_user)) -> UserPublic:
    """Return the profile of the currently authenticated user."""
    return UserPublic.model_validate(current_user)


@router.patch("/me", response_model=UserPublic)
def update_me(
    data: UserUpdate,
    current_user: User = Depends(get_current_user),
    user_service: UserService = Depends(get_user_service),
) -> UserPublic:
    """Partially update the profile of the currently authenticated user.

    Raises:
        HTTPException: 404 if the account no longer resolves; 409 if the
            requested email or username is already registered.
    """
    try:
        updated = user_service.update_profile(current_user.id, data)
    except UserNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        ) from exc
    except UserAlreadyExistsError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email or username already exists.",
        ) from exc

    return UserPublic.model_validate(updated)

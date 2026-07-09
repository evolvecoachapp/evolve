"""User routes — profile retrieval for the authenticated caller.

Routes stay thin: authentication is fully resolved by the
``get_current_user`` dependency before the handler body runs. No business
logic, database queries, or JWT handling happens in this module.
"""

from fastapi import APIRouter, Depends

from app.models.user import User
from app.schemas.user import UserPublic
from app.security.dependencies import get_current_user

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserPublic)
def get_me(current_user: User = Depends(get_current_user)) -> UserPublic:
    """Return the profile of the currently authenticated user."""
    return UserPublic.model_validate(current_user)

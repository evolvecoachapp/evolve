"""Auth routes — registration and login.

Routes stay thin: parse/validate input via Pydantic schemas, delegate to
:class:`AuthService`, and translate its return values and documented
exceptions into HTTP responses. No business logic, database queries, or
password/JWT handling happens in this module.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.repositories.user_repository import UserRepository
from app.schemas.auth import LoginRequest, TokenResponse
from app.schemas.user import UserCreate, UserPublic
from app.services.auth_service import (
    AuthService,
    InactiveAccountError,
    InvalidCredentialsError,
    UserAlreadyExistsError,
)

router = APIRouter(prefix="/auth", tags=["auth"])


def _get_auth_service(db: Session = Depends(get_db)) -> AuthService:
    """Resolve an :class:`AuthService` bound to a request-scoped session."""
    return AuthService(UserRepository(db))


@router.post(
    "/register",
    response_model=UserPublic,
    status_code=status.HTTP_201_CREATED,
)
def register(
    data: UserCreate,
    auth_service: AuthService = Depends(_get_auth_service),
) -> UserPublic:
    """Create a new user account.

    Raises:
        HTTPException: 409 if the email or username is already registered.
    """
    try:
        user = auth_service.register_user(data)
    except UserAlreadyExistsError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email or username already exists.",
        ) from exc

    return UserPublic.model_validate(user)


@router.post("/login", response_model=TokenResponse)
def login(
    data: LoginRequest,
    auth_service: AuthService = Depends(_get_auth_service),
) -> TokenResponse:
    """Authenticate a user and issue a new access/refresh token pair.

    Raises:
        HTTPException: 401 for an unknown email or wrong password, 403 if
            the account is deactivated.
    """
    try:
        result = auth_service.authenticate_user(data.email, data.password)
    except InvalidCredentialsError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        ) from exc
    except InactiveAccountError as exc:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account is inactive.",
        ) from exc

    return TokenResponse(
        access_token=result.access_token,
        refresh_token=result.refresh_token,
    )

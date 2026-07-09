"""FastAPI dependencies for resolving the authenticated user.

This module only wires dependencies together, extracts the bearer token,
and validates it via ``security.jwt``. It contains no authentication
business logic: whether a resolved user id still maps to a usable account
is decided exclusively by :class:`~app.services.auth_service.AuthService`.
This module's job ends at translating that decision into an HTTP response.
"""

import uuid

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.security.jwt import decode_token
from app.services.auth_service import AuthService, InactiveAccountError, InvalidCredentialsError

_bearer_scheme = HTTPBearer()

_INVALID_CREDENTIALS_EXCEPTION = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Could not validate credentials.",
    headers={"WWW-Authenticate": "Bearer"},
)
_INACTIVE_ACCOUNT_EXCEPTION = HTTPException(
    status_code=status.HTTP_403_FORBIDDEN,
    detail="This account is inactive.",
)


def get_auth_service(db: Session = Depends(get_db)) -> AuthService:
    """Resolve an :class:`AuthService` bound to a request-scoped session.

    Shared by every route that needs auth business logic, so the
    repository/service wiring exists in exactly one place.
    """
    return AuthService(UserRepository(db))


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(_bearer_scheme),
    auth_service: AuthService = Depends(get_auth_service),
) -> User:
    """Resolve the authenticated :class:`User` from a bearer access token.

    Decodes and validates the JWT itself (signature, expiry, ``type``
    claim), then delegates the "is this account still usable" decision to
    :meth:`AuthService.resolve_current_user`.

    Args:
        credentials: The bearer token extracted from the ``Authorization``
            header by :class:`~fastapi.security.HTTPBearer`.
        auth_service: The request-scoped :class:`AuthService`.

    Returns:
        The authenticated, active :class:`User`.

    Raises:
        HTTPException: 401 if the token is missing, malformed, expired, or
            does not resolve to a live account; 403 if the account is
            deactivated.
    """
    try:
        payload = decode_token(credentials.credentials, expected_type="access")
        user_id = uuid.UUID(payload["sub"])
    except (jwt.PyJWTError, KeyError, ValueError) as exc:
        raise _INVALID_CREDENTIALS_EXCEPTION from exc

    try:
        return auth_service.resolve_current_user(user_id)
    except InvalidCredentialsError as exc:
        raise _INVALID_CREDENTIALS_EXCEPTION from exc
    except InactiveAccountError as exc:
        raise _INACTIVE_ACCOUNT_EXCEPTION from exc

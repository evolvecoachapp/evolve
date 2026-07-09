"""Pydantic v2 schemas for the Auth domain — request/response contracts.

Kept separate from ``app.schemas.user`` because these schemas describe the
authentication flow (credentials in, tokens out) rather than the ``User``
resource itself. ``LoginRequest`` intentionally carries only the two fields
needed to authenticate; registration continues to use ``UserCreate``.
"""

from pydantic import BaseModel, EmailStr

from app.schemas.user import PasswordField


class LoginRequest(BaseModel):
    """Input schema for ``POST /api/v1/auth/login``.

    No password-strength validation is applied here (unlike
    ``UserCreate``) — this is a login attempt against an already-chosen
    password, not a new-password submission.
    """

    email: EmailStr
    password: PasswordField


class RefreshRequest(BaseModel):
    """Input schema for ``POST /api/v1/auth/refresh``.

    Carries only the opaque refresh token; it is a bearer credential, not
    new user input, so no strength-style validation is applied here.
    """

    refresh_token: str


class TokenResponse(BaseModel):
    """Output schema for a successful login: an access/refresh token pair.

    Never includes user profile data — callers that need the profile use
    the existing ``UserPublic`` schema against a separate endpoint.
    """

    access_token: str
    refresh_token: str
    token_type: str = "bearer"

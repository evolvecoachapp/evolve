"""Business logic for user registration and authentication.

``AuthService`` is the only layer that composes ``UserRepository``,
``security.hashing``, and ``security.jwt`` for the auth domain. It contains
no HTTP concepts, no raw SQL, and no FastAPI dependencies — those belong to
a future API layer that will translate this service's return values and
exceptions into request/response schemas and HTTP status codes.
"""

import uuid
from dataclasses import dataclass

import jwt
from sqlalchemy.exc import IntegrityError

from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserCreate
from app.security.hashing import hash_password, verify_password
from app.security.jwt import create_access_token, create_refresh_token, decode_token


class AuthServiceError(Exception):
    """Base class for all errors raised by :class:`AuthService`."""


class UserAlreadyExistsError(AuthServiceError):
    """Raised when registration is attempted with a duplicate email or username."""


class InvalidCredentialsError(AuthServiceError):
    """Raised when authentication fails due to an unknown email or wrong password.

    Intentionally used for both cases (unknown email vs. wrong password) so
    callers cannot enumerate registered emails from the failure reason.
    """


class InactiveAccountError(AuthServiceError):
    """Raised when credentials are valid but the account is deactivated."""


@dataclass(frozen=True)
class AuthResult:
    """Outcome of a successful authentication: the user and their JWT pair.

    This is an internal service-layer DTO, not a Pydantic schema — mapping
    to an API-facing ``TokenResponse``/``UserPublic`` pair is the
    responsibility of a future API layer.
    """

    user: User
    access_token: str
    refresh_token: str


class AuthService:
    """Registration and authentication workflows for the ``User`` domain.

    Depends on an injected :class:`UserRepository` rather than a raw
    :class:`~sqlalchemy.orm.Session`, so it can be unit-tested with a mocked
    repository. Transaction boundaries (commit/rollback) are managed here,
    since no request-scoped commit dependency exists yet.
    """

    def __init__(self, user_repository: UserRepository) -> None:
        self.user_repository = user_repository

    def register_user(self, data: UserCreate) -> User:
        """Create a new user account.

        Hashes the plaintext password and persists a new :class:`User` row.
        Uniqueness is checked up front for a clear error message, and again
        implicitly at commit time (via the table's unique constraints) to
        stay correct under concurrent registrations for the same
        email/username.

        Args:
            data: Validated registration input.

        Returns:
            The newly created and persisted :class:`User`.

        Raises:
            UserAlreadyExistsError: If the email or username is already
                registered.
        """
        # Pre-check for a clear, fast failure in the common (non-racing) case;
        # the try/except below still guards against a concurrent registration
        # slipping past this check before the unique constraint is enforced.
        if self.user_repository.exists_email(
            data.email
        ) or self.user_repository.exists_username(data.username):
            raise UserAlreadyExistsError("User already exists.")

        user = User(
            email=data.email,
            username=data.username,
            hashed_password=hash_password(data.password),
            first_name=data.first_name,
            last_name=data.last_name,
            birth_date=data.birth_date,
            gender=data.gender,
            height_cm=data.height_cm,
            current_weight_kg=data.current_weight_kg,
            target_weight_kg=data.target_weight_kg,
            activity_level=data.activity_level,
            goal=data.goal,
        )

        try:
            created_user = self.user_repository.create(user)
            self.user_repository.db.commit()
        except IntegrityError as exc:
            self.user_repository.db.rollback()
            raise UserAlreadyExistsError("User already exists.") from exc

        return created_user

    def authenticate_user(self, email: str, password: str) -> AuthResult:
        """Verify credentials and issue a new access/refresh token pair.

        Args:
            email: The account email to authenticate.
            password: The plaintext password to verify.

        Returns:
            An :class:`AuthResult` containing the authenticated user and a
            freshly issued access/refresh token pair.

        Raises:
            InvalidCredentialsError: If no matching, non-deleted account
                exists, or the password does not match.
            InactiveAccountError: If the password is correct but the account
                is inactive.
        """
        user = self.user_repository.get_by_email(email)
        if user is None or user.deleted_at is not None:
            raise InvalidCredentialsError("Invalid email or password.")

        if not verify_password(password, user.hashed_password):
            raise InvalidCredentialsError("Invalid email or password.")

        if not user.is_active:
            raise InactiveAccountError("This account is inactive.")

        access_token = create_access_token(subject=user.id)
        refresh_token = create_refresh_token(subject=user.id)

        return AuthResult(user=user, access_token=access_token, refresh_token=refresh_token)

    def resolve_current_user(self, user_id: uuid.UUID) -> User:
        """Resolve and validate the active user identified by a JWT ``sub`` claim.

        This is the single account-state gate ("does this user id still
        resolve to a live, active account") shared by both the
        ``get_current_user`` dependency and :meth:`refresh_access_token` —
        it intentionally mirrors the post-lookup checks in
        :meth:`authenticate_user` so that definition of an unusable account
        exists in one place.

        Args:
            user_id: The user id extracted from a validated JWT's ``sub``
                claim.

        Returns:
            The resolved, active :class:`User`.

        Raises:
            InvalidCredentialsError: If no matching, non-deleted account
                exists for ``user_id``.
            InactiveAccountError: If the account exists but is deactivated.
        """
        user = self.user_repository.get_by_id(user_id)
        if user is None or user.deleted_at is not None:
            raise InvalidCredentialsError("Invalid credentials.")

        if not user.is_active:
            raise InactiveAccountError("This account is inactive.")

        return user

    def refresh_access_token(self, refresh_token: str) -> AuthResult:
        """Validate a refresh token and issue a new access/refresh token pair.

        Args:
            refresh_token: The previously issued refresh token to redeem.

        Returns:
            An :class:`AuthResult` containing the resolved user and a newly
            issued access/refresh token pair.

        Raises:
            InvalidCredentialsError: If the token is malformed, expired,
                incorrectly signed, not of type ``"refresh"``, or its
                subject no longer resolves to a live account.
            InactiveAccountError: If the token is otherwise valid but the
                account is deactivated.
        """
        try:
            payload = decode_token(refresh_token, expected_type="refresh")
            user_id = uuid.UUID(payload["sub"])
        except (jwt.PyJWTError, KeyError, ValueError) as exc:
            raise InvalidCredentialsError("Invalid or expired refresh token.") from exc

        user = self.resolve_current_user(user_id)

        return AuthResult(
            user=user,
            access_token=create_access_token(subject=user.id),
            refresh_token=create_refresh_token(subject=user.id),
        )

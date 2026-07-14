"""Business logic for the User profile domain — read and update workflows.

``UserService`` composes only :class:`~app.repositories.user_repository.UserRepository`
— no service-to-service composition. Contains no HTTP concepts and no raw SQL;
the API layer translates this service's return values and documented exceptions
into request/response schemas and HTTP status codes.
"""

import uuid

from sqlalchemy.exc import IntegrityError

from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserUpdate
from app.services.auth_service import UserAlreadyExistsError

__all__ = ["UserServiceError", "UserNotFoundError", "UserService"]


class UserServiceError(Exception):
    """Base class for all errors raised by :class:`UserService`."""


class UserNotFoundError(UserServiceError):
    """Raised when a referenced user does not resolve to a live account."""


class UserService:
    """User profile read and partial-update workflows.

    Depends on an injected repository rather than a raw
    :class:`~sqlalchemy.orm.Session`, so it can be unit-tested with mocks
    (matches :class:`~app.services.goal_service.GoalService`).
    """

    def __init__(self, user_repository: UserRepository) -> None:
        self.user_repository = user_repository

    def update_profile(self, user_id: uuid.UUID, data: UserUpdate) -> User:
        """Partially update the profile of the user identified by ``user_id``.

        Raises:
            UserNotFoundError: If ``user_id`` does not resolve to a
                non-deleted account.
            UserAlreadyExistsError: If the requested email or username is
                already registered to another account.
        """
        user = self.user_repository.get_by_id(user_id)
        if user is None or user.deleted_at is not None:
            raise UserNotFoundError("User not found.")

        if data.email is not None and data.email != user.email:
            if self.user_repository.exists_email(data.email):
                raise UserAlreadyExistsError("User already exists.")
            user.email = data.email

        if data.username is not None and data.username != user.username:
            if self.user_repository.exists_username(data.username):
                raise UserAlreadyExistsError("User already exists.")
            user.username = data.username

        if data.first_name is not None:
            user.first_name = data.first_name
        if data.last_name is not None:
            user.last_name = data.last_name
        if data.birth_date is not None:
            user.birth_date = data.birth_date
        if data.gender is not None:
            user.gender = data.gender
        if data.height_cm is not None:
            user.height_cm = data.height_cm
        if data.current_weight_kg is not None:
            user.current_weight_kg = data.current_weight_kg
        if data.target_weight_kg is not None:
            user.target_weight_kg = data.target_weight_kg
        if data.activity_level is not None:
            user.activity_level = data.activity_level
        if data.goal is not None:
            user.goal = data.goal

        try:
            updated = self.user_repository.update(user)
            self.user_repository.db.commit()
        except IntegrityError as exc:
            self.user_repository.db.rollback()
            raise UserAlreadyExistsError("User already exists.") from exc

        return updated

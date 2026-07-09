"""Repository for persistence and retrieval of :class:`~app.models.user.User`.

Contains no business logic, password hashing, or authentication concerns —
those belong to the service layer. This class only translates calls into
SQLAlchemy queries against an injected :class:`~sqlalchemy.orm.Session` and
returns ORM model instances.
"""

import uuid
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.user import User


class UserRepository:
    """Data-access layer for the ``users`` table.

    The session is injected by the caller (typically a service resolving
    ``Depends(get_db)``) rather than created internally, keeping this class
    testable and free of lifecycle concerns.
    """

    def __init__(self, db: Session) -> None:
        self.db = db

    def create(self, user: User) -> User:
        """Persist a fully constructed :class:`User` instance and return it."""
        self.db.add(user)
        self.db.flush()
        self.db.refresh(user)
        return user

    def get_by_id(self, user_id: uuid.UUID) -> User | None:
        """Return the user with the given id, or ``None`` if not found."""
        return self.db.execute(
            select(User).where(User.id == user_id)
        ).scalar_one_or_none()

    def get_by_email(self, email: str) -> User | None:
        """Return the user with the given email, or ``None`` if not found."""
        return self.db.execute(
            select(User).where(User.email == email)
        ).scalar_one_or_none()

    def get_by_username(self, username: str) -> User | None:
        """Return the user with the given username, or ``None`` if not found."""
        return self.db.execute(
            select(User).where(User.username == username)
        ).scalar_one_or_none()

    def list(self, *, limit: int = 100, offset: int = 0) -> list[User]:
        """Return a page of users ordered by creation date.

        Does not filter by ``deleted_at`` or ``is_active`` — applying such
        rules is a service-layer responsibility.
        """
        return list(
            self.db.execute(
                select(User).order_by(User.created_at).limit(limit).offset(offset)
            ).scalars()
        )

    def update(self, user: User) -> User:
        """Flush pending changes on an already-tracked :class:`User` and return it.

        The caller is expected to mutate attributes on an instance obtained
        from this session (e.g. via :meth:`get_by_id`) before calling this
        method; no field-level logic lives here.
        """
        self.db.flush()
        self.db.refresh(user)
        return user

    def delete(self, user_id: uuid.UUID) -> bool:
        """Soft-delete a user by setting ``deleted_at``.

        Returns ``True`` if a matching user was found and marked deleted,
        ``False`` otherwise. Does not check whether the user was already
        soft-deleted — that decision belongs to the service layer.
        """
        user = self.get_by_id(user_id)
        if user is None:
            return False
        user.deleted_at = datetime.now(timezone.utc)
        self.db.flush()
        return True

    def exists_email(self, email: str) -> bool:
        """Return ``True`` if a user with the given email exists."""
        return (
            self.db.execute(select(User.id).where(User.email == email)).first()
            is not None
        )

    def exists_username(self, username: str) -> bool:
        """Return ``True`` if a user with the given username exists."""
        return (
            self.db.execute(select(User.id).where(User.username == username)).first()
            is not None
        )

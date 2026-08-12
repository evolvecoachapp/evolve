"""Repository for persistence and retrieval of :class:`~app.models.user.User`.

Contains no business logic, password hashing, or authentication concerns —
those belong to the service layer. This class only translates calls into
SQLAlchemy queries against an injected :class:`~sqlalchemy.orm.Session` and
returns ORM model instances.
"""

import uuid
from datetime import datetime, timezone

from sqlalchemy import Select, func, select
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

    def _filtered_query(
        self,
        *,
        include_deleted: bool = False,
        is_active: bool | None = None,
        is_superuser: bool | None = None,
    ) -> Select:
        """Build the shared filter predicate for :meth:`list` and :meth:`count`."""
        query = select(User)
        if not include_deleted:
            query = query.where(User.deleted_at.is_(None))
        if is_active is not None:
            query = query.where(User.is_active.is_(is_active))
        if is_superuser is not None:
            query = query.where(User.is_superuser.is_(is_superuser))
        return query

    def list(
        self,
        *,
        limit: int = 100,
        offset: int = 0,
        include_deleted: bool = False,
        is_active: bool | None = None,
        is_superuser: bool | None = None,
    ) -> list[User]:
        """Return a page of users ordered by most recently created first.

        Filtering by ``deleted_at`` / ``is_active`` / ``is_superuser`` is
        applied here as query predicates; which combination a caller
        requests remains a service-layer decision.
        """
        query = self._filtered_query(
            include_deleted=include_deleted,
            is_active=is_active,
            is_superuser=is_superuser,
        )
        query = query.order_by(User.created_at.desc()).limit(limit).offset(offset)
        return list(self.db.execute(query).scalars())

    def count(
        self,
        *,
        include_deleted: bool = False,
        is_active: bool | None = None,
        is_superuser: bool | None = None,
    ) -> int:
        """Return the total count of users matching the same filters as :meth:`list`."""
        query = self._filtered_query(
            include_deleted=include_deleted,
            is_active=is_active,
            is_superuser=is_superuser,
        )
        count_query = select(func.count()).select_from(query.subquery())
        return self.db.execute(count_query).scalar_one()

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

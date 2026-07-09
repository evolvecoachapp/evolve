"""Password hashing primitives.

This module contains only password hashing/verification primitives. It has
no business logic, no database access, and no knowledge of the ``User``
model or any other domain concept — it is a pure utility intended to be
consumed by the future ``AuthService`` (Sprint 2.2).

Hashing is performed with `pwdlib <https://frankie567.github.io/pwdlib/>`_
using the Argon2 algorithm exclusively. The hasher is wired up explicitly
(rather than via ``PasswordHash.recommended()``) so the algorithm in use is
guaranteed regardless of upstream default changes.
"""

from pwdlib import PasswordHash
from pwdlib.hashers.argon2 import Argon2Hasher

_password_hash = PasswordHash((Argon2Hasher(),))


def hash_password(password: str) -> str:
    """Hash a plaintext password using Argon2.

    Args:
        password: The plaintext password to hash.

    Returns:
        A self-contained Argon2 hash string (algorithm, parameters, and
        salt are all encoded in the returned value), suitable for storage
        in ``User.hashed_password``.
    """
    return _password_hash.hash(password)


def verify_password(password: str, hashed_password: str) -> bool:
    """Verify a plaintext password against an Argon2 hash.

    Args:
        password: The plaintext password to check.
        hashed_password: The previously stored Argon2 hash to check against.

    Returns:
        ``True`` if ``password`` matches ``hashed_password``, ``False``
        otherwise.

    Raises:
        pwdlib.exceptions.UnknownHashError: If ``hashed_password`` was not
            produced by a configured hasher (e.g. it is malformed or was
            hashed with an unsupported algorithm). This is intentionally
            not caught here; callers (e.g. the future ``AuthService``)
            decide how to handle it.
    """
    return _password_hash.verify(password, hashed_password)

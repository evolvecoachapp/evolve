"""JSON Web Token creation and decoding primitives.

This module contains only JWT primitives. It has no business logic, no
database access, and no knowledge of the ``User`` model or any other
domain concept — it is a pure utility intended to be consumed by the
future ``AuthService`` and ``get_current_user`` dependency.

Tokens are signed and verified with `PyJWT <https://pyjwt.readthedocs.io/>`_
using the algorithm configured in application settings (HS256 by default).
Callers never see PyJWT exceptions leak past this module's contract in
spirit — this module simply lets them propagate, since no custom
exception hierarchy is introduced in this sprint; callers should handle
``jwt.PyJWTError`` (and its subclasses, e.g. ``jwt.ExpiredSignatureError``)
directly.
"""

import uuid
from datetime import datetime, timedelta, timezone
from typing import Any, Literal

import jwt

from app.core.config import settings

_RESERVED_CLAIMS = frozenset({"sub", "type", "iat", "nbf", "exp", "jti", "iss"})


def _build_payload(
    subject: str | uuid.UUID,
    token_type: Literal["access", "refresh"],
    expires_delta: timedelta,
    extra_claims: dict[str, Any] | None,
) -> dict[str, Any]:
    """Assemble the claim set shared by access and refresh tokens.

    Reserved claims (``sub``, ``type``, ``iat``, ``nbf``, ``exp``, ``jti``,
    ``iss``) always take precedence over ``extra_claims`` so callers cannot
    accidentally (or maliciously) override token identity or lifetime.
    """
    now = datetime.now(timezone.utc)
    payload: dict[str, Any] = dict(extra_claims) if extra_claims else {}
    for claim in _RESERVED_CLAIMS:
        payload.pop(claim, None)

    payload.update(
        {
            "sub": str(subject),
            "type": token_type,
            "iat": now,
            "nbf": now,
            "exp": now + expires_delta,
            "jti": str(uuid.uuid4()),
        }
    )
    if settings.jwt_issuer:
        payload["iss"] = settings.jwt_issuer

    return payload


def create_access_token(
    subject: str | uuid.UUID,
    extra_claims: dict[str, Any] | None = None,
) -> str:
    """Create a short-lived access token for ``subject``.

    Args:
        subject: The token subject, typically a ``User.id``. Stored as the
            ``sub`` claim (stringified).
        extra_claims: Optional additional claims to embed. Reserved claims
            (``sub``, ``type``, ``iat``, ``nbf``, ``exp``, ``jti``, ``iss``)
            cannot be overridden this way.

    Returns:
        An encoded, signed JWT string with ``type`` claim ``"access"``.
    """
    payload = _build_payload(
        subject,
        token_type="access",
        expires_delta=timedelta(minutes=settings.access_token_expire_minutes),
        extra_claims=extra_claims,
    )
    return jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


def create_refresh_token(
    subject: str | uuid.UUID,
    extra_claims: dict[str, Any] | None = None,
) -> str:
    """Create a long-lived refresh token for ``subject``.

    Args:
        subject: The token subject, typically a ``User.id``. Stored as the
            ``sub`` claim (stringified).
        extra_claims: Optional additional claims to embed. Reserved claims
            (``sub``, ``type``, ``iat``, ``nbf``, ``exp``, ``jti``, ``iss``)
            cannot be overridden this way.

    Returns:
        An encoded, signed JWT string with ``type`` claim ``"refresh"``.
    """
    payload = _build_payload(
        subject,
        token_type="refresh",
        expires_delta=timedelta(days=settings.refresh_token_expire_days),
        extra_claims=extra_claims,
    )
    return jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


def decode_token(
    token: str,
    expected_type: Literal["access", "refresh"] | None = None,
) -> dict[str, Any]:
    """Decode and verify a JWT, returning its claims.

    Signature, expiry (``exp``), not-before (``nbf``), and issuer (when
    configured) are all verified by PyJWT. The algorithm is pinned to
    ``settings.jwt_algorithm`` explicitly — the algorithm declared in the
    token header itself is never trusted.

    Args:
        token: The encoded JWT string to decode.
        expected_type: If provided, the decoded ``type`` claim must match
            this value or ``jwt.InvalidTokenError`` is raised.

    Returns:
        The decoded claim set as a dictionary.

    Raises:
        jwt.ExpiredSignatureError: If the token's ``exp`` claim has passed.
        jwt.InvalidTokenError: If the token is malformed, has an invalid
            signature, is missing required claims, has an unexpected
            issuer, or (when ``expected_type`` is given) has a ``type``
            claim that does not match.
    """
    payload = jwt.decode(
        token,
        settings.jwt_secret_key,
        algorithms=[settings.jwt_algorithm],
        issuer=settings.jwt_issuer,
        options={"require": ["exp", "iat", "nbf", "sub", "type"]},
    )

    if expected_type is not None and payload.get("type") != expected_type:
        raise jwt.InvalidTokenError(
            f"Expected token type '{expected_type}', got '{payload.get('type')}'"
        )

    return payload

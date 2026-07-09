"""Security primitives package — password hashing and JWT creation/decoding.

Deliberately does not re-export ``security.dependencies`` here: that module
imports ``AuthService`` from the service layer, and ``AuthService`` in turn
imports the primitives below (``hashing``, ``jwt``) via this very package.
Re-exporting it here would reintroduce that cycle. Callers needing
``get_current_user``/``get_auth_service`` import
``app.security.dependencies`` directly.
"""

from app.security.hashing import hash_password, verify_password
from app.security.jwt import create_access_token, create_refresh_token, decode_token

__all__ = [
    "hash_password",
    "verify_password",
    "create_access_token",
    "create_refresh_token",
    "decode_token",
]

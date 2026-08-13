"""Public deployment health schema. Never includes secrets or exception text."""

from pydantic import BaseModel


class HealthStatus(BaseModel):
    """Sanitized liveness/readiness payload for ``GET /health``."""

    status: str
    api: str
    database: str
    version: str

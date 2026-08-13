"""Public deployment health probe — unauthenticated, sanitized, no secrets."""

from fastapi import APIRouter, status
from fastapi.responses import JSONResponse

from app.core.health import check_system_health
from app.schemas.health import HealthStatus

router = APIRouter(tags=["health"])


@router.get(
    "/health",
    response_model=HealthStatus,
    responses={status.HTTP_503_SERVICE_UNAVAILABLE: {"model": HealthStatus}},
)
def get_health() -> HealthStatus | JSONResponse:
    """Return 200 when the API is up and PostgreSQL is reachable; 503 otherwise."""
    snapshot = check_system_health()
    payload = HealthStatus(
        status=snapshot.status,
        api=snapshot.api,
        database=snapshot.database,
        version=snapshot.version,
    )
    if not snapshot.is_ok:
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content=payload.model_dump(),
        )
    return payload

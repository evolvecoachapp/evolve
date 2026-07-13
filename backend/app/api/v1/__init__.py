"""Version 1 API router — assembles domain routers under ``/api/v1``."""

from fastapi import APIRouter

from app.api.v1.auth import router as auth_router
from app.api.v1.catalog import router as catalog_router
from app.api.v1.coach import router as coach_router
from app.api.v1.exercises import router as exercises_router
from app.api.v1.goals import router as goals_router
from app.api.v1.nutrition import router as nutrition_router
from app.api.v1.progress import router as progress_router
from app.api.v1.recovery import router as recovery_router
from app.api.v1.users import router as users_router
from app.api.v1.workout_logs import router as workout_logs_router
from app.api.v1.workout_resolution import router as workout_resolution_router

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(auth_router)
api_router.include_router(users_router)
api_router.include_router(exercises_router)
api_router.include_router(catalog_router)
api_router.include_router(workout_logs_router)
api_router.include_router(workout_resolution_router)
api_router.include_router(nutrition_router)
api_router.include_router(recovery_router)
api_router.include_router(coach_router)
api_router.include_router(goals_router)
api_router.include_router(progress_router)

__all__ = ["api_router"]

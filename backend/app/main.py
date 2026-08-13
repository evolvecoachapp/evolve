import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.health import router as health_router
from app.api.v1 import api_router
from app.core.config import settings

logger = logging.getLogger("evolve")


def _configure_logging() -> None:
    """Send application logs to stderr so they appear in container output."""
    if logger.handlers:
        return
    handler = logging.StreamHandler()
    handler.setFormatter(
        logging.Formatter("%(asctime)s %(levelname)s [%(name)s] %(message)s")
    )
    logger.setLevel(logging.INFO)
    logger.addHandler(handler)
    logger.propagate = False


_configure_logging()


@asynccontextmanager
async def lifespan(_app: FastAPI):
    logger.info(
        "Starting %s version=%s env=%s",
        settings.app_name,
        settings.api_version,
        settings.app_env,
    )
    yield
    logger.info("Stopped %s", settings.app_name)


app = FastAPI(
    title=settings.app_name,
    version=settings.api_version,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=False,
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

app.include_router(health_router)
app.include_router(api_router)

@app.get("/")
def root():
    return {
        "name": "EVOLVE API",
        "status": "online",
        "version": "1.0.0"
    }

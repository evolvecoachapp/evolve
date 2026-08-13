"""Apply Alembic migrations, then replace this process with the API server.

Used as the backend container entrypoint. Configuration comes from the
process environment; this image does not embed secrets.
"""

from __future__ import annotations

import logging
import os
import subprocess
import sys
import time

from sqlalchemy import create_engine, text

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s [%(name)s] %(message)s",
)
logger = logging.getLogger("evolve.entrypoint")

DB_WAIT_SECONDS = 60
DB_WAIT_INTERVAL_SECONDS = 1


def _wait_for_database(database_url: str) -> None:
    engine = create_engine(database_url, pool_pre_ping=True)
    deadline = time.monotonic() + DB_WAIT_SECONDS
    try:
        while time.monotonic() < deadline:
            try:
                with engine.connect() as connection:
                    connection.execute(text("SELECT 1"))
                logger.info("Database is reachable")
                return
            except Exception as exc:
                logger.info("Waiting for database (%s)", type(exc).__name__)
                time.sleep(DB_WAIT_INTERVAL_SECONDS)
        logger.error("Database did not become reachable")
        sys.exit(1)
    finally:
        engine.dispose()


def main() -> None:
    database_url = os.environ.get("DATABASE_URL")
    if not database_url:
        logger.error("DATABASE_URL is not set")
        sys.exit(1)

    logger.info("Starting backend container")
    _wait_for_database(database_url)

    logger.info("Applying database migrations")
    completed = subprocess.run(["alembic", "upgrade", "head"], check=False)
    if completed.returncode != 0:
        logger.error("Database migrations failed")
        sys.exit(completed.returncode)

    if len(sys.argv) < 2:
        logger.error("No API command provided")
        sys.exit(1)

    logger.info("Starting API")
    os.execvp(sys.argv[1], sys.argv[1:])


if __name__ == "__main__":
    main()

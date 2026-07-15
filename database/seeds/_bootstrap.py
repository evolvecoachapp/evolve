"""Bootstrap database seed scripts to load backend configuration like uvicorn.

Uvicorn is started from ``backend/``, so :class:`~app.core.config.Settings`
resolves ``env_file='.env'`` to ``backend/.env``. Seed scripts are run from
the project root (``python database/seeds/...``), so they must adopt the same
working directory before importing anything from ``app``.
"""

import os
import sys
from pathlib import Path

BACKEND_ROOT = Path(__file__).resolve().parents[2] / "backend"


def bootstrap_backend() -> Path:
    """Point cwd and ``sys.path`` at ``backend/`` before ``app`` imports."""
    os.chdir(BACKEND_ROOT)
    backend_root = str(BACKEND_ROOT)
    if backend_root not in sys.path:
        sys.path.insert(0, backend_root)
    return BACKEND_ROOT

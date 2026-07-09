from app.db.database import Base

# Import models here so Alembic discovers them via Base.metadata.
from app.models.user import User  # noqa: F401

from app.db.database import Base

# Import models here so Alembic discovers them via Base.metadata.
from app.models.user import User  # noqa: F401
from app.models.muscle_group import MuscleGroup  # noqa: F401
from app.models.equipment import Equipment  # noqa: F401
from app.models.exercise import (  # noqa: F401
    Exercise,
    ExerciseEquipment,
    ExerciseMuscleGroup,
    ExerciseSubstitution,
)
from app.models.program import (  # noqa: F401
    Program,
    ProgramAssignment,
    ProgramDay,
)
from app.models.workout import (  # noqa: F401
    Workout,
    WorkoutExercise,
    WorkoutLog,
)

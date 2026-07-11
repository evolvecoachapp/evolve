"""Seed the Exercise catalog: muscle groups, equipment, exercises, and substitutions.

Run from anywhere with the backend's virtual environment active:

    python database/seeds/seed_exercises.py

Idempotent: re-running skips any muscle group, equipment entry, or exercise
that already exists (matched by slug/name), so this is safe to run again
after adding new entries below. Uses the same repository/service layer as
the API — no raw SQL, per ``backend.mdc``.
"""

import sys
import uuid
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "backend"))

from app.db.database import SessionLocal  # noqa: E402
from app.models.equipment import Equipment  # noqa: E402
from app.models.exercise import DifficultyLevel, ExerciseCategory, SubstitutionReason  # noqa: E402
from app.models.muscle_group import MuscleGroup  # noqa: E402
from app.repositories.equipment_repository import EquipmentRepository  # noqa: E402
from app.repositories.exercise_repository import ExerciseRepository  # noqa: E402
from app.repositories.muscle_group_repository import MuscleGroupRepository  # noqa: E402
from app.schemas.catalog import EquipmentCreate, MuscleGroupCreate  # noqa: E402
from app.schemas.exercise import (  # noqa: E402
    ExerciseCreate,
    ExerciseEquipmentInput,
    ExerciseMuscleGroupInput,
    ExerciseSubstitutionCreate,
)
from app.services.catalog_service import CatalogService  # noqa: E402
from app.services.exercise_service import ExerciseAlreadyExistsError, ExerciseService  # noqa: E402
from app.utils.text import slugify  # noqa: E402

MUSCLE_GROUPS: list[tuple[str, str, str]] = [
    ("chest", "Chest", "Pectoral muscles."),
    ("back", "Back", "Lats, traps, rhomboids, and erector spinae."),
    ("shoulders", "Shoulders", "Deltoids."),
    ("biceps", "Biceps", "Front of the upper arm."),
    ("triceps", "Triceps", "Back of the upper arm."),
    ("forearms", "Forearms", "Wrist and grip flexors/extensors."),
    ("abs", "Abs", "Rectus abdominis and obliques."),
    ("quadriceps", "Quadriceps", "Front of the thigh."),
    ("hamstrings", "Hamstrings", "Back of the thigh."),
    ("glutes", "Glutes", "Hip extensors."),
    ("calves", "Calves", "Gastrocnemius and soleus."),
    ("full-body", "Full Body", "Movements that do not isolate a single muscle group."),
]

EQUIPMENT: list[tuple[str, str, str | None]] = [
    ("barbell", "Barbell", None),
    ("dumbbell", "Dumbbell", None),
    ("kettlebell", "Kettlebell", None),
    ("machine", "Machine", "Any selectorized or plate-loaded gym machine."),
    ("cable", "Cable Machine", None),
    ("bodyweight", "Bodyweight", "No equipment required."),
    ("resistance-band", "Resistance Band", None),
    ("bench", "Bench", None),
    ("pull-up-bar", "Pull-Up Bar", None),
]

# (name, description, instructions, difficulty, category,
#  [(muscle_group_slug, is_primary)], [(equipment_slug, is_required)])
EXERCISES: list[
    tuple[
        str,
        str | None,
        str | None,
        DifficultyLevel,
        ExerciseCategory,
        list[tuple[str, bool]],
        list[tuple[str, bool]],
    ]
] = [
    (
        "Barbell Back Squat",
        "A foundational lower-body compound lift.",
        "Bar on the upper back, feet shoulder-width, squat to depth, drive up through the heels.",
        DifficultyLevel.INTERMEDIATE,
        ExerciseCategory.COMPOUND,
        [("quadriceps", True), ("glutes", False), ("hamstrings", False)],
        [("barbell", True)],
    ),
    (
        "Barbell Bench Press",
        "The primary horizontal pressing movement for the chest.",
        "Lower the bar to the mid-chest, press back up to full elbow extension.",
        DifficultyLevel.INTERMEDIATE,
        ExerciseCategory.COMPOUND,
        [("chest", True), ("triceps", False), ("shoulders", False)],
        [("barbell", True), ("bench", True)],
    ),
    (
        "Deadlift",
        "A hip-hinge compound lift for the entire posterior chain.",
        "Hinge at the hips, keep the bar close, drive the hips forward to stand tall.",
        DifficultyLevel.ADVANCED,
        ExerciseCategory.COMPOUND,
        [("back", True), ("hamstrings", False), ("glutes", False)],
        [("barbell", True)],
    ),
    (
        "Overhead Press",
        "A standing vertical press for shoulder strength.",
        "Press the bar from shoulder height to full overhead lockout.",
        DifficultyLevel.INTERMEDIATE,
        ExerciseCategory.COMPOUND,
        [("shoulders", True), ("triceps", False)],
        [("barbell", True)],
    ),
    (
        "Barbell Row",
        "A horizontal pulling compound lift for back thickness.",
        "Hinge forward, row the bar to the lower ribs, control the descent.",
        DifficultyLevel.INTERMEDIATE,
        ExerciseCategory.COMPOUND,
        [("back", True), ("biceps", False)],
        [("barbell", True)],
    ),
    (
        "Pull-Up",
        "A vertical bodyweight pulling movement.",
        "Hang from the bar, pull the chest toward the bar, lower under control.",
        DifficultyLevel.INTERMEDIATE,
        ExerciseCategory.COMPOUND,
        [("back", True), ("biceps", False)],
        [("pull-up-bar", True)],
    ),
    (
        "Push-Up",
        "A bodyweight horizontal pressing movement.",
        "Hands under shoulders, lower the chest to the floor, press back up.",
        DifficultyLevel.BEGINNER,
        ExerciseCategory.COMPOUND,
        [("chest", True), ("triceps", False), ("shoulders", False)],
        [("bodyweight", True)],
    ),
    (
        "Dumbbell Bicep Curl",
        "An isolation movement for the biceps.",
        "Curl the dumbbells from full extension to full flexion, keep elbows fixed.",
        DifficultyLevel.BEGINNER,
        ExerciseCategory.ISOLATION,
        [("biceps", True)],
        [("dumbbell", True)],
    ),
    (
        "Tricep Pushdown",
        "A cable isolation movement for the triceps.",
        "Elbows fixed at the sides, extend the arms down against the cable.",
        DifficultyLevel.BEGINNER,
        ExerciseCategory.ISOLATION,
        [("triceps", True)],
        [("cable", True)],
    ),
    (
        "Dumbbell Shoulder Press",
        "A seated or standing dumbbell press for the shoulders.",
        "Press the dumbbells from shoulder height to overhead.",
        DifficultyLevel.BEGINNER,
        ExerciseCategory.COMPOUND,
        [("shoulders", True), ("triceps", False)],
        [("dumbbell", True), ("bench", False)],
    ),
    (
        "Lat Pulldown",
        "A machine-assisted vertical pulling movement.",
        "Pull the bar down to the upper chest, control the return.",
        DifficultyLevel.BEGINNER,
        ExerciseCategory.COMPOUND,
        [("back", True), ("biceps", False)],
        [("cable", True)],
    ),
    (
        "Leg Press",
        "A machine-based compound lower-body movement.",
        "Lower the sled under control, press through the full foot.",
        DifficultyLevel.BEGINNER,
        ExerciseCategory.COMPOUND,
        [("quadriceps", True), ("glutes", False)],
        [("machine", True)],
    ),
    (
        "Leg Curl",
        "A machine isolation movement for the hamstrings.",
        "Curl the pad toward the glutes, control the return.",
        DifficultyLevel.BEGINNER,
        ExerciseCategory.ISOLATION,
        [("hamstrings", True)],
        [("machine", True)],
    ),
    (
        "Leg Extension",
        "A machine isolation movement for the quadriceps.",
        "Extend the knees against the pad, control the return.",
        DifficultyLevel.BEGINNER,
        ExerciseCategory.ISOLATION,
        [("quadriceps", True)],
        [("machine", True)],
    ),
    (
        "Standing Calf Raise",
        "An isolation movement for the calves.",
        "Rise onto the toes, pause, lower under control past neutral.",
        DifficultyLevel.BEGINNER,
        ExerciseCategory.ISOLATION,
        [("calves", True)],
        [("machine", True)],
    ),
    (
        "Plank",
        "A static core-stability hold.",
        "Hold a straight-body position on forearms and toes, brace the core.",
        DifficultyLevel.BEGINNER,
        ExerciseCategory.ISOLATION,
        [("abs", True)],
        [("bodyweight", True)],
    ),
    (
        "Crunch",
        "A basic isolation movement for the abs.",
        "Curl the shoulders toward the pelvis, control the descent.",
        DifficultyLevel.BEGINNER,
        ExerciseCategory.ISOLATION,
        [("abs", True)],
        [("bodyweight", True)],
    ),
    (
        "Kettlebell Swing",
        "A ballistic hip-hinge movement for posterior chain power.",
        "Hinge and swing the kettlebell to shoulder height using hip drive, not the arms.",
        DifficultyLevel.INTERMEDIATE,
        ExerciseCategory.COMPOUND,
        [("glutes", True), ("hamstrings", False), ("back", False)],
        [("kettlebell", True)],
    ),
    (
        "Goblet Squat",
        "A beginner-friendly loaded squat variation.",
        "Hold the kettlebell at the chest, squat to depth, drive back up.",
        DifficultyLevel.BEGINNER,
        ExerciseCategory.COMPOUND,
        [("quadriceps", True), ("glutes", False)],
        [("kettlebell", True)],
    ),
    (
        "Dumbbell Lunge",
        "A single-leg compound movement for the lower body.",
        "Step forward into a lunge, drive back to standing, alternate legs.",
        DifficultyLevel.BEGINNER,
        ExerciseCategory.COMPOUND,
        [("quadriceps", True), ("glutes", False), ("hamstrings", False)],
        [("dumbbell", True)],
    ),
    (
        "Resistance Band Row",
        "A band-based horizontal pulling movement.",
        "Anchor the band, row the handles to the ribs, squeeze the shoulder blades.",
        DifficultyLevel.BEGINNER,
        ExerciseCategory.COMPOUND,
        [("back", True), ("biceps", False)],
        [("resistance-band", True)],
    ),
    (
        "Face Pull",
        "An isolation movement for shoulder health and rear delts.",
        "Pull the rope toward the face at eye level, externally rotate at the finish.",
        DifficultyLevel.BEGINNER,
        ExerciseCategory.ISOLATION,
        [("shoulders", True), ("back", False)],
        [("cable", True)],
    ),
    (
        "Hip Thrust",
        "A hip-extension compound movement targeting the glutes.",
        "Shoulders on the bench, drive the hips up until fully extended.",
        DifficultyLevel.BEGINNER,
        ExerciseCategory.COMPOUND,
        [("glutes", True), ("hamstrings", False)],
        [("barbell", True), ("bench", True)],
    ),
    (
        "Burpee",
        "A full-body conditioning movement.",
        "Squat, kick back to a plank, push up, jump feet in, jump up.",
        DifficultyLevel.INTERMEDIATE,
        ExerciseCategory.CARDIO,
        [("full-body", True)],
        [("bodyweight", True)],
    ),
    (
        "Mountain Climber",
        "A dynamic core and conditioning movement.",
        "From a plank, drive the knees toward the chest in an alternating sprint motion.",
        DifficultyLevel.BEGINNER,
        ExerciseCategory.CARDIO,
        [("abs", True), ("full-body", False)],
        [("bodyweight", True)],
    ),
    (
        "Cat-Cow Stretch",
        "A gentle spinal mobility drill.",
        "Alternate between arching and rounding the spine on hands and knees.",
        DifficultyLevel.BEGINNER,
        ExerciseCategory.MOBILITY,
        [("back", True)],
        [("bodyweight", True)],
    ),
]

# (exercise_name, substitute_exercise_name, reason)
SUBSTITUTIONS: list[tuple[str, str, SubstitutionReason]] = [
    ("Barbell Back Squat", "Goblet Squat", SubstitutionReason.EQUIPMENT_ALTERNATIVE),
    ("Barbell Bench Press", "Push-Up", SubstitutionReason.EQUIPMENT_ALTERNATIVE),
    ("Push-Up", "Barbell Bench Press", SubstitutionReason.DIFFICULTY_PROGRESSION),
    ("Pull-Up", "Lat Pulldown", SubstitutionReason.DIFFICULTY_REGRESSION),
    ("Deadlift", "Kettlebell Swing", SubstitutionReason.EQUIPMENT_ALTERNATIVE),
    ("Overhead Press", "Dumbbell Shoulder Press", SubstitutionReason.EQUIPMENT_ALTERNATIVE),
]


def _get_or_create_muscle_group(
    catalog_service: CatalogService,
    muscle_group_repository: MuscleGroupRepository,
    slug: str,
    name: str,
    description: str | None,
) -> MuscleGroup:
    existing = muscle_group_repository.get_by_slug(slug)
    if existing is not None:
        return existing
    return catalog_service.create_muscle_group(
        MuscleGroupCreate(name=name, slug=slug, description=description)
    )


def _get_or_create_equipment(
    catalog_service: CatalogService,
    equipment_repository: EquipmentRepository,
    slug: str,
    name: str,
    description: str | None,
) -> Equipment:
    existing = equipment_repository.get_by_slug(slug)
    if existing is not None:
        return existing
    return catalog_service.create_equipment(
        EquipmentCreate(name=name, slug=slug, description=description)
    )


def run_seed() -> None:
    """Populate muscle groups, equipment, exercises, and substitutions."""
    db = SessionLocal()
    try:
        muscle_group_repository = MuscleGroupRepository(db)
        equipment_repository = EquipmentRepository(db)
        catalog_service = CatalogService(muscle_group_repository, equipment_repository)
        exercise_repository = ExerciseRepository(db)
        exercise_service = ExerciseService(exercise_repository, catalog_service)

        muscle_groups_by_slug = {
            slug: _get_or_create_muscle_group(
                catalog_service, muscle_group_repository, slug, name, description
            )
            for slug, name, description in MUSCLE_GROUPS
        }
        equipment_by_slug = {
            slug: _get_or_create_equipment(
                catalog_service, equipment_repository, slug, name, description
            )
            for slug, name, description in EQUIPMENT
        }
        print(
            f"Muscle groups: {len(muscle_groups_by_slug)}, "
            f"Equipment: {len(equipment_by_slug)}"
        )

        created_count = 0
        skipped_count = 0
        for (
            name,
            description,
            instructions,
            difficulty_level,
            category,
            muscle_group_entries,
            equipment_entries,
        ) in EXERCISES:
            expected_slug = slugify(name)
            if exercise_repository.get_by_slug(expected_slug) is not None:
                skipped_count += 1
                continue

            data = ExerciseCreate(
                name=name,
                description=description,
                instructions=instructions,
                difficulty_level=difficulty_level,
                category=category,
                muscle_groups=[
                    ExerciseMuscleGroupInput(
                        muscle_group_id=muscle_groups_by_slug[mg_slug].id,
                        is_primary=is_primary,
                    )
                    for mg_slug, is_primary in muscle_group_entries
                ],
                equipment=[
                    ExerciseEquipmentInput(
                        equipment_id=equipment_by_slug[eq_slug].id,
                        is_required=is_required,
                    )
                    for eq_slug, is_required in equipment_entries
                ],
            )
            try:
                exercise_service.create_exercise(data)
                created_count += 1
            except ExerciseAlreadyExistsError:
                skipped_count += 1

        print(f"Exercises created: {created_count}, skipped (already existed): {skipped_count}")

        substitutions_created = 0
        exercise_ids_by_name: dict[str, uuid.UUID] = {}
        for exercise_name, substitute_name, _ in SUBSTITUTIONS:
            for lookup_name in (exercise_name, substitute_name):
                if lookup_name not in exercise_ids_by_name:
                    exercise = exercise_repository.get_by_slug(slugify(lookup_name))
                    if exercise is not None:
                        exercise_ids_by_name[lookup_name] = exercise.id

        for exercise_name, substitute_name, reason in SUBSTITUTIONS:
            exercise_id = exercise_ids_by_name.get(exercise_name)
            substitute_id = exercise_ids_by_name.get(substitute_name)
            if exercise_id is None or substitute_id is None:
                continue
            existing_substitutes = {
                link.substitute_exercise_id
                for link in exercise_repository.list_substitutes(exercise_id)
            }
            if substitute_id in existing_substitutes:
                continue
            exercise_service.add_substitution(
                exercise_id,
                ExerciseSubstitutionCreate(substitute_exercise_id=substitute_id, reason=reason),
            )
            substitutions_created += 1

        print(f"Substitutions created: {substitutions_created}")
    finally:
        db.close()


if __name__ == "__main__":
    run_seed()

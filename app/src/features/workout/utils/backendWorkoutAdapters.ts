import type {
  ExerciseCatalogRefDto,
  WorkoutLogDetailDto,
  WorkoutLogExerciseReadDto,
  WorkoutPreviewDto,
  WorkoutPublicDto,
  WorkoutSetLogReadDto,
} from "../../../types/api";
import type { Exercise } from "../models/Exercise";
import type { ExerciseEquipment } from "../models/ExerciseEquipment";
import type { ExerciseHistory } from "../models/ExerciseHistory";
import type { ExerciseMuscleGroup } from "../models/ExerciseMuscleGroup";
import type { ExerciseSet } from "../models/ExerciseSet";
import type { Workout, WorkoutScheduleLabels } from "../models/Workout";
import type { WorkoutExercise } from "../models/WorkoutExercise";
import type { WorkoutSession } from "../models/WorkoutSession";
import type { WorkoutStatus } from "../models/WorkoutStatus";
import type { WorkoutSummary } from "../models/WorkoutSummary";
import type { SavedSetResult } from "../types/workoutService";

/**
 * Maps EVOLVE API DTOs (`src/types/api.ts`) onto the Workout feature's
 * production models (`../models`) — the frontend counterpart to the
 * backend's `WorkoutPublic.from_model`/`WorkoutLogDetail.from_model`.
 *
 * The catalog's muscle groups/equipment are dynamic, slug-keyed reference
 * entities (see `database/seeds/seed_exercises.py`), while the existing
 * `ExerciseMuscleGroup`/`ExerciseEquipment` models are closed string
 * unions the UI already switches on (icons, colors, filters — see
 * `presentationFormatters.ts`). Rather than widen those unions (which
 * would ripple into every exhaustive `Record<MuscleGroup, ...>` already
 * written against them), unmapped catalog slugs fall back to the closest
 * existing value below. This is a deliberate, documented approximation.
 */

const MUSCLE_GROUP_SLUG_MAP: Record<string, ExerciseMuscleGroup> = {
  chest: "chest",
  back: "back",
  shoulders: "shoulders",
  biceps: "biceps",
  triceps: "triceps",
  forearms: "triceps",
  abs: "core",
  quadriceps: "quads",
  hamstrings: "hamstrings",
  glutes: "glutes",
  calves: "calves",
  "full-body": "core",
};

/** Maps a catalog muscle-group slug to the frontend's closed `ExerciseMuscleGroup` union, defaulting to `"core"`. */
export function mapMuscleGroupSlug(slug: string | null): ExerciseMuscleGroup {
  if (!slug) {
    return "core";
  }
  return MUSCLE_GROUP_SLUG_MAP[slug] ?? "core";
}

const EQUIPMENT_SLUG_MAP: Record<string, ExerciseEquipment> = {
  barbell: "barbell",
  dumbbell: "dumbbell",
  kettlebell: "kettlebell",
  machine: "machine",
  cable: "cable",
  bodyweight: "bodyweight",
  "resistance-band": "cable",
  bench: "bodyweight",
  "pull-up-bar": "bodyweight",
};

/** Preferred display order when an exercise lists multiple equipment slugs. */
const EQUIPMENT_PRIORITY: ExerciseEquipment[] = [
  "barbell",
  "dumbbell",
  "kettlebell",
  "cable",
  "machine",
  "smith_machine",
  "bodyweight",
];

/** Maps a catalog exercise's equipment slugs to a single frontend `ExerciseEquipment`, defaulting to `"bodyweight"`. */
export function mapEquipmentSlugs(slugs: string[]): ExerciseEquipment {
  const mapped = slugs
    .map((slug) => EQUIPMENT_SLUG_MAP[slug])
    .filter((value): value is ExerciseEquipment => value !== undefined);

  for (const candidate of EQUIPMENT_PRIORITY) {
    if (mapped.includes(candidate)) {
      return candidate;
    }
  }
  return mapped[0] ?? "bodyweight";
}

/** Maps an `ExerciseCatalogRef` embedded line item onto the frontend `Exercise` model. */
export function mapExerciseCatalogRef(dto: ExerciseCatalogRefDto, nameOverride?: string): Exercise {
  return {
    id: dto.id,
    name: nameOverride ?? dto.name,
    muscleGroup: mapMuscleGroupSlug(dto.primary_muscle_group),
    equipment: mapEquipmentSlugs(dto.equipment_slugs),
    instructions: null,
    videoUrl: dto.video_url,
    imageUrl: dto.image_url,
  };
}

function averageOrNull(min: number | null, max: number | null): number | null {
  if (min === null && max === null) {
    return null;
  }
  if (min === null) {
    return max;
  }
  if (max === null) {
    return min;
  }
  return Math.round((min + max) / 2);
}

/** Builds a placeholder (not-yet-performed) `ExerciseSet` from a template/log prescription. */
function buildPlaceholderSet(
  id: string,
  setNumber: number,
  targetRepsMin: number | null,
  targetRepsMax: number | null,
  restSeconds: number | null,
): ExerciseSet {
  return {
    id,
    setNumber,
    targetReps: averageOrNull(targetRepsMin, targetRepsMax),
    targetWeight: null,
    completedReps: null,
    completedWeight: null,
    rpe: null,
    completed: false,
    restSeconds,
  };
}

/** Maps a template `WorkoutExerciseRead` line item onto the frontend `WorkoutExercise` (prescription only, no logged sets). */
export function mapWorkoutExerciseReadToWorkoutExercise(
  dto: WorkoutPublicDto["exercises"][number],
): WorkoutExercise {
  const workingSets: ExerciseSet[] = [];
  for (let setNumber = 1; setNumber <= dto.target_sets; setNumber += 1) {
    workingSets.push(
      buildPlaceholderSet(
        `${dto.id}-set-${setNumber}`,
        setNumber,
        dto.target_reps_min,
        dto.target_reps_max,
        dto.rest_seconds,
      ),
    );
  }

  return {
    id: dto.id,
    exercise: mapExerciseCatalogRef(dto.exercise),
    order: dto.order_index,
    warmupSets: [],
    workingSets,
    notes: dto.notes,
  };
}

/**
 * Maps a `WorkoutPublic` template onto the frontend `Workout` model.
 *
 * `title`/`subtitle` are supplied by the caller rather than derived purely
 * from `dto` — mirroring `MockWorkoutService`'s catalog, `title` is the
 * broader program name (falling back to the workout's own name when there
 * is no active program) and `subtitle` is the specific workout's focus
 * (see `BackendWorkoutService.getTodayWorkout`).
 */
export function mapWorkoutPublicToWorkout(
  dto: WorkoutPublicDto,
  scheduleLabels: WorkoutScheduleLabels,
  title: string,
  subtitle: string,
): Workout {
  const exercises = [...dto.exercises]
    .sort((a, b) => a.order_index - b.order_index)
    .map(mapWorkoutExerciseReadToWorkoutExercise);

  return {
    id: dto.id,
    title,
    subtitle,
    estimatedDuration: dto.estimated_duration_minutes ?? 0,
    exercises,
    warmup: [],
    cooldown: [],
    notes: dto.description,
    coachRecommendations: [],
    scheduleLabels,
  };
}

/** Maps a logged set (a completed `WorkoutSetLogRead`) onto the frontend `ExerciseSet`. Decimal fields arrive as strings. */
function mapWorkoutSetLogToExerciseSet(
  dto: WorkoutSetLogReadDto,
  targetRepsMin: number | null,
  targetRepsMax: number | null,
  restSeconds: number | null,
): ExerciseSet {
  return {
    id: dto.id,
    setNumber: dto.set_number,
    targetReps: averageOrNull(targetRepsMin, targetRepsMax),
    targetWeight: null,
    completedReps: dto.reps,
    completedWeight: dto.weight_kg !== null ? Number(dto.weight_kg) : null,
    rpe: dto.rpe !== null ? Number(dto.rpe) : null,
    completed: true,
    restSeconds,
  };
}

/** Maps a logged/updated `WorkoutSetLogRead` onto the caller-facing `SavedSetResult` used to optimistically merge a session. */
export function mapWorkoutSetLogToSavedSetResult(dto: WorkoutSetLogReadDto): SavedSetResult {
  return {
    id: dto.id,
    completedReps: dto.reps,
    completedWeight: dto.weight_kg !== null ? Number(dto.weight_kg) : null,
    rpe: dto.rpe !== null ? Number(dto.rpe) : null,
  };
}

/**
 * Maps a `WorkoutLogExerciseRead` (an in-progress/completed session's exercise
 * instance) onto the frontend `WorkoutExercise`. Logged sets become completed
 * `ExerciseSet`s; any remaining un-logged sets up to `target_sets` are padded
 * with not-yet-performed placeholders, matching `MockWorkoutService`'s shape
 * (`workingSets.length` is always the prescribed set count).
 */
export function mapWorkoutLogExerciseReadToWorkoutExercise(dto: WorkoutLogExerciseReadDto): WorkoutExercise {
  const sortedSets = [...dto.sets].sort((a, b) => a.set_number - b.set_number);
  const warmupSets = sortedSets
    .filter((set) => set.is_warmup)
    .map((set) =>
      mapWorkoutSetLogToExerciseSet(set, dto.target_reps_min, dto.target_reps_max, dto.rest_seconds),
    );
  const loggedWorkingSets = sortedSets
    .filter((set) => !set.is_warmup)
    .map((set) =>
      mapWorkoutSetLogToExerciseSet(set, dto.target_reps_min, dto.target_reps_max, dto.rest_seconds),
    );

  const workingSets = [...loggedWorkingSets];
  const targetCount = dto.target_sets ?? loggedWorkingSets.length;
  for (let setNumber = workingSets.length + 1; setNumber <= targetCount; setNumber += 1) {
    workingSets.push(
      buildPlaceholderSet(
        `${dto.id}-set-${setNumber}`,
        setNumber,
        dto.target_reps_min,
        dto.target_reps_max,
        dto.rest_seconds,
      ),
    );
  }

  return {
    id: dto.id,
    exercise: mapExerciseCatalogRef(dto.exercise, dto.exercise_name_snapshot),
    order: dto.order_index,
    warmupSets,
    workingSets,
    notes: dto.notes,
    skipped: dto.skipped,
  };
}

const LOG_STATUS_TO_SESSION_STATUS: Record<WorkoutLogDetailDto["status"], WorkoutStatus> = {
  planned: "scheduled",
  in_progress: "in_progress",
  completed: "completed",
  skipped: "skipped",
};

/** Maps a `WorkoutLogDetail` onto the frontend `WorkoutSession`, given the session's display title/subtitle (not carried by the log itself). */
export function mapWorkoutLogDetailToWorkoutSession(
  dto: WorkoutLogDetailDto,
  title: string,
  subtitle: string,
): WorkoutSession {
  const exercises = [...dto.exercises]
    .sort((a, b) => a.order_index - b.order_index)
    .map(mapWorkoutLogExerciseReadToWorkoutExercise);

  return {
    id: dto.id,
    workoutId: dto.workout_id ?? "",
    title,
    subtitle,
    status: LOG_STATUS_TO_SESSION_STATUS[dto.status],
    startedAt: dto.started_at,
    completedAt: dto.completed_at,
    exercises,
  };
}

function countLoggedSets(dto: WorkoutLogDetailDto): number {
  return dto.exercises.reduce((total, exercise) => total + exercise.sets.length, 0);
}

function countLoggedWorkingSets(dto: WorkoutLogDetailDto): number {
  return dto.exercises.reduce(
    (total, exercise) => total + exercise.sets.filter((set) => !set.is_warmup).length,
    0,
  );
}

function computeLoggedVolumeKg(dto: WorkoutLogDetailDto): number {
  return dto.exercises.reduce((total, exercise) => {
    return (
      total +
      exercise.sets
        .filter((set) => !set.is_warmup)
        .reduce((setTotal, set) => {
          const weight = set.weight_kg !== null ? Number(set.weight_kg) : 0;
          const reps = set.reps ?? 0;
          return setTotal + weight * reps;
        }, 0)
    );
  }, 0);
}

function countCompletedExercises(dto: WorkoutLogDetailDto): number {
  return dto.exercises.filter(
    (exercise) => !exercise.skipped && exercise.sets.some((set) => !set.is_warmup),
  ).length;
}

function countTotalExercises(dto: WorkoutLogDetailDto): number {
  return dto.exercises.filter((exercise) => !exercise.skipped).length;
}

function countPrescribedSets(dto: WorkoutLogDetailDto): number {
  return dto.exercises.reduce(
    (total, exercise) => total + Math.max(exercise.target_sets ?? 0, exercise.sets.length),
    0,
  );
}

/** Maps a finished `WorkoutLogDetail` onto the frontend `WorkoutSummary`. */
export function mapWorkoutLogDetailToWorkoutSummary(dto: WorkoutLogDetailDto, title: string): WorkoutSummary {
  const startedAtMs = dto.started_at ? new Date(dto.started_at).getTime() : null;
  const completedAt = dto.completed_at ?? new Date().toISOString();
  const completedAtMs = new Date(completedAt).getTime();
  const durationMinutes =
    dto.duration_actual_minutes ??
    (startedAtMs !== null ? Math.max(1, Math.round((completedAtMs - startedAtMs) / 60_000)) : 0);

  return {
    sessionId: dto.id,
    workoutId: dto.workout_id ?? "",
    title,
    durationMinutes,
    totalVolumeKg: computeLoggedVolumeKg(dto),
    completedSets: countLoggedWorkingSets(dto),
    totalSets: countPrescribedSets(dto),
    completedExercises: countCompletedExercises(dto),
    totalExercises: countTotalExercises(dto),
    skippedExercises: dto.exercises.filter((exercise) => exercise.skipped).length,
    completedAt,
  };
}

/** Builds `WorkoutScheduleLabels` from a resolution preview's week/day context, falling back to generic labels. */
export function mapPreviewToScheduleLabels(dto: WorkoutPreviewDto): WorkoutScheduleLabels {
  return {
    weekLabel: dto.week_number !== null ? `Week ${dto.week_number}` : "This week",
    dayLabel: dto.day_label ?? (dto.day_number !== null ? `Day ${dto.day_number}` : "Today"),
  };
}

/**
 * Builds per-exercise `ExerciseHistory` rows from a completed session's
 * full detail (used by `getHistory()`, which fetches details for each
 * session returned by `GET /workout-logs?status=completed`).
 */
export function mapWorkoutLogDetailToExerciseHistory(dto: WorkoutLogDetailDto): ExerciseHistory[] {
  const completedAt = dto.completed_at ?? dto.created_at;
  const entries: ExerciseHistory[] = [];

  for (const exercise of dto.exercises) {
    const workingSets = exercise.sets.filter((set) => !set.is_warmup);
    if (workingSets.length === 0) {
      continue;
    }

    const withWeights = workingSets.map((set) => ({
      set,
      weight: set.weight_kg !== null ? Number(set.weight_kg) : 0,
      reps: set.reps ?? 0,
    }));
    const topSet = withWeights.reduce((best, current) => (current.weight > best.weight ? current : best));

    entries.push({
      id: `${dto.id}-${exercise.id}`,
      exerciseId: exercise.exercise_id,
      exerciseName: exercise.exercise_name_snapshot,
      muscleGroup: mapMuscleGroupSlug(exercise.exercise.primary_muscle_group),
      sessionId: dto.id,
      completedAt,
      topSetWeight: topSet.set.weight_kg !== null ? Number(topSet.set.weight_kg) : null,
      topSetReps: topSet.set.reps,
      totalVolume: withWeights.reduce((volume, entry) => volume + entry.weight * entry.reps, 0),
    });
  }

  return entries;
}

import type {
  ExerciseCatalogRefDto,
  WorkoutLogDetailDto,
  WorkoutLogExerciseReadDto,
  WorkoutPreviewDto,
  WorkoutPublicDto,
  WorkoutSetLogReadDto,
} from "../../../types/api";
import { emptyWorkoutRuntimeData } from "../mocks/workoutRuntimeData";
import type {
  WorkoutExerciseDto,
  WorkoutRuntimeDto,
  WorkoutSetDto,
} from "../types/workoutRuntimeDto";

/**
 * Maps Workout API DTOs (`src/types/api.ts`) onto the Workout Runtime Experience
 * read model. Counterpart to Nutrition/Recovery's `mapBackend*ToExperienceDto`.
 *
 * Only projects fields the backend actually returns. Rest-timer state, analytics,
 * PR derivation, and in-session substitutions have no matching Experience contract
 * methods and are not invented here.
 */

const DEFAULT_REST_SECONDS = 90;
const DEFAULT_TARGET_REPS = 8;

/** Stable empty-runtime ids so the Workout tab can distinguish rest vs missing data. */
export const WORKOUT_RUNTIME_REST_DAY_ID = "workout-runtime-rest-day";
export const WORKOUT_RUNTIME_PROGRAM_COMPLETE_ID = "workout-runtime-program-complete";
export const WORKOUT_RUNTIME_NO_PROGRAM_ID = "workout-runtime-no-program";

/** Shared titles for template preview and log-backed runtime so Start does not flicker labels. */
export function titlesForBackendPreview(preview: WorkoutPreviewDto): {
  title: string;
  subtitle: string;
} {
  const title = preview.program?.name ?? preview.workout?.name ?? "Workout";
  const subtitle = preview.workout?.name ?? preview.day_label ?? "Today's workout";
  return { title, subtitle };
}

function formatSlugLabel(slug: string | null | undefined, fallback: string): string {
  if (!slug || !slug.trim()) {
    return fallback;
  }
  return slug
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
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

function toNumberOrNull(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function muscleGroupLabel(exercise: ExerciseCatalogRefDto): string {
  return formatSlugLabel(exercise.primary_muscle_group, "General");
}

function equipmentLabel(exercise: ExerciseCatalogRefDto): string {
  return formatSlugLabel(exercise.equipment_slugs[0] ?? null, "General");
}

function buildPlaceholderSet(params: {
  readonly id: string;
  readonly targetRepsMin: number | null;
  readonly targetRepsMax: number | null;
  readonly restSeconds: number | null;
  readonly skipped?: boolean;
}): WorkoutSetDto {
  const targetReps =
    averageOrNull(params.targetRepsMin, params.targetRepsMax) ?? DEFAULT_TARGET_REPS;
  const targetRepsMax =
    params.targetRepsMax !== null &&
    params.targetRepsMin !== null &&
    params.targetRepsMax !== params.targetRepsMin
      ? params.targetRepsMax
      : params.targetRepsMax !== null && params.targetRepsMin === null
        ? params.targetRepsMax
        : null;

  return Object.freeze({
    id: params.id,
    targetReps,
    targetRepsMax,
    targetRpe: null,
    restSeconds: params.restSeconds && params.restSeconds > 0 ? params.restSeconds : DEFAULT_REST_SECONDS,
    completed: false,
    skipped: params.skipped === true,
  });
}

function mapLoggedSet(
  dto: WorkoutSetLogReadDto,
  targetRepsMin: number | null,
  targetRepsMax: number | null,
  restSeconds: number | null,
): WorkoutSetDto {
  const targetReps = averageOrNull(targetRepsMin, targetRepsMax) ?? DEFAULT_TARGET_REPS;
  const targetRepsMaxValue =
    targetRepsMax !== null && targetRepsMin !== null && targetRepsMax !== targetRepsMin
      ? targetRepsMax
      : null;

  return Object.freeze({
    id: dto.id,
    targetReps,
    targetRepsMax: targetRepsMaxValue,
    targetRpe: null,
    weight: toNumberOrNull(dto.weight_kg),
    repetitions: dto.reps,
    rpe: toNumberOrNull(dto.rpe),
    notes: dto.notes ?? undefined,
    restSeconds: restSeconds && restSeconds > 0 ? restSeconds : DEFAULT_REST_SECONDS,
    completed: true,
    skipped: false,
  });
}

/** Maps a logged exercise instance (with padded remaining prescription sets). */
export function mapWorkoutLogExerciseToRuntimeExerciseDto(
  dto: WorkoutLogExerciseReadDto,
): WorkoutExerciseDto {
  const sortedSets = [...dto.sets]
    .filter((set) => !set.is_warmup)
    .sort((a, b) => a.set_number - b.set_number);

  const sets: WorkoutSetDto[] = sortedSets.map((set) =>
    mapLoggedSet(set, dto.target_reps_min, dto.target_reps_max, dto.rest_seconds),
  );

  const targetCount = Math.max(dto.target_sets ?? 0, sets.length);
  for (let setNumber = sets.length + 1; setNumber <= targetCount; setNumber += 1) {
    sets.push(
      buildPlaceholderSet({
        id: `${dto.id}-set-${setNumber}`,
        targetRepsMin: dto.target_reps_min,
        targetRepsMax: dto.target_reps_max,
        restSeconds: dto.rest_seconds,
        skipped: dto.skipped,
      }),
    );
  }

  // Skipped with no logged sets still needs at least one visible skipped slot.
  if (dto.skipped && sets.length === 0) {
    sets.push(
      buildPlaceholderSet({
        id: `${dto.id}-set-1`,
        targetRepsMin: dto.target_reps_min,
        targetRepsMax: dto.target_reps_max,
        restSeconds: dto.rest_seconds,
        skipped: true,
      }),
    );
  }

  return Object.freeze({
    id: dto.id,
    name: dto.exercise_name_snapshot || dto.exercise.name,
    muscleGroup: muscleGroupLabel(dto.exercise),
    equipment: equipmentLabel(dto.exercise),
    sets: Object.freeze(sets),
  });
}

/** Maps a template exercise line item into prescribed (unlogged) runtime sets. */
export function mapWorkoutExerciseReadToRuntimeExerciseDto(
  dto: WorkoutPublicDto["exercises"][number],
): WorkoutExerciseDto {
  const sets: WorkoutSetDto[] = [];
  for (let setNumber = 1; setNumber <= dto.target_sets; setNumber += 1) {
    sets.push(
      buildPlaceholderSet({
        id: `${dto.id}-set-${setNumber}`,
        targetRepsMin: dto.target_reps_min,
        targetRepsMax: dto.target_reps_max,
        restSeconds: dto.rest_seconds,
      }),
    );
  }

  return Object.freeze({
    id: dto.id,
    name: dto.exercise.name,
    muscleGroup: muscleGroupLabel(dto.exercise),
    equipment: equipmentLabel(dto.exercise),
    sets: Object.freeze(sets),
  });
}

function uniqueMuscleGroups(exercises: readonly WorkoutExerciseDto[]): string {
  return exercises
    .map((exercise) => exercise.muscleGroup)
    .filter((value, index, values) => values.indexOf(value) === index)
    .join(", ");
}

/** True when a log is the one-at-a-time in-progress session, never history. */
export function isInProgressWorkoutLog(
  log: WorkoutLogDetailDto | null | undefined,
): log is WorkoutLogDetailDto {
  return log != null && log.status === "in_progress";
}

function finishedAtForLog(dto: WorkoutLogDetailDto): string | null {
  if (dto.status === "completed" || dto.status === "skipped") {
    return dto.completed_at;
  }
  return null;
}

/** Maps an in-progress/completed `WorkoutLogDetail` onto `WorkoutRuntimeDto`. */
export function mapWorkoutLogDetailToRuntimeDto(
  dto: WorkoutLogDetailDto,
  title: string,
  subtitle: string,
): WorkoutRuntimeDto {
  const exercises = Object.freeze(
    [...dto.exercises]
      .sort((a, b) => a.order_index - b.order_index)
      .map(mapWorkoutLogExerciseToRuntimeExerciseDto),
  );

  return Object.freeze({
    id: dto.id,
    title,
    subtitle,
    muscleGroups: uniqueMuscleGroups(exercises),
    exercises,
    sessionNotes: dto.notes ?? "",
    startedAt: dto.started_at,
    finishedAt: finishedAtForLog(dto),
    empty: exercises.length === 0,
  });
}

/** Maps a `WorkoutPublic` template onto a prescription-only `WorkoutRuntimeDto`. */
export function mapWorkoutPublicToRuntimeDto(
  dto: WorkoutPublicDto,
  title: string,
  subtitle: string,
): WorkoutRuntimeDto {
  const exercises = Object.freeze(
    [...dto.exercises]
      .sort((a, b) => a.order_index - b.order_index)
      .map(mapWorkoutExerciseReadToRuntimeExerciseDto),
  );

  return Object.freeze({
    id: dto.id,
    title,
    subtitle,
    muscleGroups: uniqueMuscleGroups(exercises),
    exercises,
    sessionNotes: "",
    startedAt: null,
    finishedAt: null,
    empty: exercises.length === 0,
  });
}

/** Empty runtime seed used for rest days / no program / completed-with-no-active-log. */
export function mapEmptyWorkoutRuntimeDto(
  overrides: Partial<WorkoutRuntimeDto> = {},
): WorkoutRuntimeDto {
  return Object.freeze({
    ...emptyWorkoutRuntimeData,
    exercises: Object.freeze([]),
    ...overrides,
    empty: true,
  });
}

/**
 * Composes today's runtime read model from resolution preview + optional active log.
 * Prefer the live in-progress log when present; a completed/skipped log must not
 * remain the editable session — fall through to the next resolved day instead.
 */
export function mapBackendWorkoutToExperienceDto(input: {
  readonly preview: WorkoutPreviewDto;
  readonly activeLog: WorkoutLogDetailDto | null;
}): WorkoutRuntimeDto {
  const { preview, activeLog } = input;

  if (isInProgressWorkoutLog(activeLog)) {
    const { title, subtitle } = titlesForBackendPreview(preview);
    return mapWorkoutLogDetailToRuntimeDto(activeLog, title, subtitle);
  }

  if (preview.state === "training_day" && preview.workout) {
    const { title, subtitle } = titlesForBackendPreview(preview);
    return mapWorkoutPublicToRuntimeDto(preview.workout, title, subtitle);
  }

  if (preview.state === "rest_day") {
    return mapEmptyWorkoutRuntimeDto({
      id: WORKOUT_RUNTIME_REST_DAY_ID,
      title: "Rest Day",
      subtitle: preview.day_label ?? "Scheduled rest",
    });
  }

  if (preview.state === "program_complete") {
    return mapEmptyWorkoutRuntimeDto({
      id: WORKOUT_RUNTIME_PROGRAM_COMPLETE_ID,
      title: "Program Complete",
      subtitle: preview.program?.name ?? "No workout scheduled",
    });
  }

  return mapEmptyWorkoutRuntimeDto({
    id: WORKOUT_RUNTIME_NO_PROGRAM_ID,
    title: "No Workout",
    subtitle: "No active training program",
  });
}

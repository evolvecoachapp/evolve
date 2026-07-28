import {
  createWorkoutExercise,
  type WorkoutExercise,
  WorkoutExerciseStatuses,
} from "../models/experience/WorkoutExercise";
import {
  createWorkoutNotes,
  type WorkoutNotes,
} from "../models/experience/WorkoutNotes";
import {
  createWorkoutProgress,
  type WorkoutProgress,
} from "../models/experience/WorkoutProgress";
import {
  createWorkoutRuntime,
  type WorkoutRuntime,
} from "../models/experience/WorkoutRuntime";
import {
  createWorkoutRuntimeState,
  WorkoutRuntimeStatuses,
  type WorkoutRuntimeStatus,
} from "../models/experience/WorkoutRuntimeState";
import {
  createWorkoutSet,
  type WorkoutSet,
  WorkoutSetStatuses,
} from "../models/experience/WorkoutSet";
import {
  createWorkoutStatistics,
  type WorkoutStatistics,
} from "../models/experience/WorkoutStatistics";
import {
  createIdleWorkoutTimer,
  type WorkoutTimer,
} from "../models/experience/WorkoutTimer";
import type {
  WorkoutExerciseDto,
  WorkoutRuntimeDto,
  WorkoutSetDto,
} from "../types/workoutRuntimeDto";

const DEFAULT_REST_SECONDS = 90;
const SECONDS_PER_SET_ESTIMATE = 45;

function mapSet(
  dto: WorkoutSetDto,
  exerciseId: string,
  index: number,
  isCurrent: boolean,
): WorkoutSet {
  const completed = dto.completed === true;
  const skipped = dto.skipped === true;
  let status: import("../models/experience/WorkoutSet").WorkoutSetStatus =
    WorkoutSetStatuses.PENDING;
  if (completed) {
    status = WorkoutSetStatuses.COMPLETED;
  } else if (skipped) {
    status = WorkoutSetStatuses.SKIPPED;
  } else if (isCurrent) {
    status = WorkoutSetStatuses.CURRENT;
  }

  return createWorkoutSet({
    id: dto.id,
    exerciseId,
    index,
    targetReps: dto.targetReps,
    targetRepsMax: dto.targetRepsMax ?? null,
    targetRpe: dto.targetRpe ?? null,
    weight: dto.weight ?? null,
    repetitions: dto.repetitions ?? dto.targetReps,
    rpe: dto.rpe ?? dto.targetRpe ?? null,
    notes: dto.notes ?? "",
    status,
    completed,
    restSeconds: dto.restSeconds > 0 ? dto.restSeconds : DEFAULT_REST_SECONDS,
  });
}

function mapExercise(
  dto: WorkoutExerciseDto,
  order: number,
  currentExerciseIndex: number,
  currentSetIndex: number,
): WorkoutExercise {
  const isCurrent = order === currentExerciseIndex;
  const sets = Object.freeze(
    dto.sets.map((set, index) =>
      mapSet(set, dto.id, index, isCurrent && index === currentSetIndex),
    ),
  );
  const completedSetCount = sets.filter((set) => set.completed).length;
  const totalSetCount = sets.length;
  const allDone =
    totalSetCount > 0 && sets.every((set) => set.completed || set.status === WorkoutSetStatuses.SKIPPED);
  const anyStarted = sets.some(
    (set) => set.completed || set.status === WorkoutSetStatuses.SKIPPED,
  );

  let status: import("../models/experience/WorkoutExercise").WorkoutExerciseStatus =
    WorkoutExerciseStatuses.PENDING;
  if (allDone) {
    status = WorkoutExerciseStatuses.COMPLETED;
  } else if (isCurrent) {
    status = WorkoutExerciseStatuses.CURRENT;
  } else if (anyStarted) {
    status = WorkoutExerciseStatuses.PENDING;
  }

  const progressPercent =
    totalSetCount === 0
      ? 0
      : Math.round((completedSetCount / totalSetCount) * 100);

  return createWorkoutExercise({
    id: dto.id,
    name: dto.name,
    order,
    muscleGroup: dto.muscleGroup,
    equipment: dto.equipment,
    sets,
    currentSetIndex: isCurrent ? currentSetIndex : 0,
    status,
    completedSetCount,
    totalSetCount,
    progressPercent,
    detailDestination: `/(app)/workout/exercise/${dto.id}`,
  });
}

export function computeWorkoutProgress(
  exercises: readonly WorkoutExercise[],
  durationSeconds: number,
): WorkoutProgress {
  const totalExercises = exercises.length;
  const completedExercises = exercises.filter(
    (exercise) => exercise.status === WorkoutExerciseStatuses.COMPLETED,
  ).length;
  const totalSets = exercises.reduce(
    (sum, exercise) => sum + exercise.totalSetCount,
    0,
  );
  const completedSets = exercises.reduce(
    (sum, exercise) => sum + exercise.completedSetCount,
    0,
  );
  const remainingSets = Math.max(totalSets - completedSets, 0);
  const completionPercent =
    totalSets === 0 ? 0 : Math.round((completedSets / totalSets) * 100);
  const estimatedRemainingMinutes = Math.max(
    1,
    Math.ceil(
      (remainingSets * SECONDS_PER_SET_ESTIMATE +
        remainingSets * DEFAULT_REST_SECONDS) /
        60,
    ),
  );

  return createWorkoutProgress({
    totalExercises,
    completedExercises,
    remainingExercises: Math.max(totalExercises - completedExercises, 0),
    totalSets,
    completedSets,
    remainingSets,
    completionPercent,
    estimatedRemainingMinutes: remainingSets === 0 ? 0 : estimatedRemainingMinutes,
    durationSeconds,
  });
}

export function computeWorkoutStatistics(
  exercises: readonly WorkoutExercise[],
  progress: WorkoutProgress,
): WorkoutStatistics {
  let totalVolume = 0;
  const rpeValues: number[] = [];

  for (const exercise of exercises) {
    for (const set of exercise.sets) {
      if (!set.completed) {
        continue;
      }
      const weight = set.weight ?? 0;
      const reps = set.repetitions ?? 0;
      totalVolume += weight * reps;
      if (typeof set.rpe === "number") {
        rpeValues.push(set.rpe);
      }
    }
  }

  const averageRpe =
    rpeValues.length === 0
      ? null
      : Math.round(
          (rpeValues.reduce((sum, value) => sum + value, 0) / rpeValues.length) *
            10,
        ) / 10;

  return createWorkoutStatistics({
    totalVolume: Math.round(totalVolume),
    completedSets: progress.completedSets,
    remainingSets: progress.remainingSets,
    averageRpe,
    durationSeconds: progress.durationSeconds,
    estimatedRemainingMinutes: progress.estimatedRemainingMinutes,
  });
}

function resolveCursor(dto: WorkoutRuntimeDto): {
  currentExerciseIndex: number;
  currentSetIndex: number;
} {
  for (let exerciseIndex = 0; exerciseIndex < dto.exercises.length; exerciseIndex += 1) {
    const exercise = dto.exercises[exerciseIndex];
    for (let setIndex = 0; setIndex < exercise.sets.length; setIndex += 1) {
      const set = exercise.sets[setIndex];
      if (!set.completed && !set.skipped) {
        return { currentExerciseIndex: exerciseIndex, currentSetIndex: setIndex };
      }
    }
  }
  const lastExerciseIndex = Math.max(dto.exercises.length - 1, 0);
  const lastSets = dto.exercises[lastExerciseIndex]?.sets ?? [];
  return {
    currentExerciseIndex: lastExerciseIndex,
    currentSetIndex: Math.max(lastSets.length - 1, 0),
  };
}

export interface MapWorkoutRuntimeOptions {
  readonly dto: WorkoutRuntimeDto;
  readonly timer?: WorkoutTimer;
  readonly notes?: WorkoutNotes;
  readonly durationSeconds?: number;
  readonly currentExerciseIndex?: number;
  readonly currentSetIndex?: number;
  readonly finishedAt?: string | null;
  readonly startedAt?: string | null;
}

/** Maps a provider DTO into the immutable WorkoutRuntime presentation model. */
export function mapWorkoutRuntime(
  options: MapWorkoutRuntimeOptions,
): WorkoutRuntime {
  const { dto } = options;
  const isEmpty = dto.empty === true || dto.exercises.length === 0;
  const cursor = resolveCursor(dto);
  const currentExerciseIndex =
    options.currentExerciseIndex ?? cursor.currentExerciseIndex;
  const currentSetIndex = options.currentSetIndex ?? cursor.currentSetIndex;

  const exercises = Object.freeze(
    dto.exercises.map((exercise, index) =>
      mapExercise(exercise, index, currentExerciseIndex, currentSetIndex),
    ),
  );

  const durationSeconds = options.durationSeconds ?? 0;
  const progress = computeWorkoutProgress(exercises, durationSeconds);
  const statistics = computeWorkoutStatistics(exercises, progress);
  const allComplete =
    !isEmpty &&
    exercises.every(
      (exercise) => exercise.status === WorkoutExerciseStatuses.COMPLETED,
    );

  let status: import("../models/experience/WorkoutRuntimeState").WorkoutRuntimeStatus =
    WorkoutRuntimeStatuses.READY;
  if (isEmpty) {
    status = WorkoutRuntimeStatuses.EMPTY;
  } else if (options.finishedAt || allComplete) {
    status = WorkoutRuntimeStatuses.COMPLETED;
  } else if (progress.completedSets > 0) {
    status = WorkoutRuntimeStatuses.ACTIVE;
  }

  return createWorkoutRuntime({
    id: dto.id,
    title: dto.title,
    subtitle: dto.subtitle,
    muscleGroups: dto.muscleGroups,
    exercises,
    currentExerciseIndex,
    currentSetIndex,
    progress,
    timer: options.timer ?? createIdleWorkoutTimer(),
    statistics,
    notes:
      options.notes ??
      createWorkoutNotes(dto.sessionNotes ?? "", null),
    state: createWorkoutRuntimeState(status),
    startedAt: options.startedAt ?? dto.startedAt ?? null,
    finishedAt: options.finishedAt ?? null,
    historyDestination: "/(app)/workout/history",
    statisticsDestination: "/(app)/workout/analytics",
    isEmpty,
  });
}

/** Rebuild presentation runtime after local mutations. */
export function rebuildWorkoutRuntime(
  runtime: WorkoutRuntime,
  overrides: Partial<{
    exercises: readonly WorkoutExercise[];
    currentExerciseIndex: number;
    currentSetIndex: number;
    timer: WorkoutTimer;
    notes: WorkoutNotes;
    durationSeconds: number;
    startedAt: string | null;
    finishedAt: string | null;
    status: WorkoutRuntimeStatus;
  }> = {},
): WorkoutRuntime {
  const exercises = Object.freeze([
    ...(overrides.exercises ?? runtime.exercises),
  ]);
  const durationSeconds =
    overrides.durationSeconds ?? runtime.progress.durationSeconds;
  const progress = computeWorkoutProgress(exercises, durationSeconds);
  const statistics = computeWorkoutStatistics(exercises, progress);
  const isEmpty = exercises.length === 0;
  const finishedAt = overrides.finishedAt ?? runtime.finishedAt;
  const allComplete =
    !isEmpty &&
    exercises.every(
      (exercise) => exercise.status === WorkoutExerciseStatuses.COMPLETED,
    );

  let status: WorkoutRuntimeStatus =
    overrides.status ??
    runtime.state.status;
  if (overrides.status === undefined) {
    if (isEmpty) {
      status = WorkoutRuntimeStatuses.EMPTY;
    } else if (finishedAt || allComplete) {
      status = WorkoutRuntimeStatuses.COMPLETED;
    } else if (overrides.timer?.status === "running") {
      status = WorkoutRuntimeStatuses.RESTING;
    } else if (overrides.timer?.status === "paused") {
      status = WorkoutRuntimeStatuses.PAUSED;
    } else if (progress.completedSets > 0) {
      status = WorkoutRuntimeStatuses.ACTIVE;
    } else {
      status = WorkoutRuntimeStatuses.READY;
    }
  }

  return createWorkoutRuntime({
    ...runtime,
    exercises,
    currentExerciseIndex:
      overrides.currentExerciseIndex ?? runtime.currentExerciseIndex,
    currentSetIndex: overrides.currentSetIndex ?? runtime.currentSetIndex,
    progress,
    statistics,
    timer: overrides.timer ?? runtime.timer,
    notes: overrides.notes ?? runtime.notes,
    state: createWorkoutRuntimeState(status),
    startedAt: overrides.startedAt ?? runtime.startedAt,
    finishedAt,
    isEmpty,
  });
}

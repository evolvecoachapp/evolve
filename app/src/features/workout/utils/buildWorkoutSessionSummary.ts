import type { WorkoutSession } from "../../training/application";
import type { CompletedWorkoutExercise } from "../models/CompletedWorkout";
import type { SessionExecutionState } from "../types/sessionExecutionState";
import type { WorkoutSessionSummary } from "../types/workoutSessionSummary";
import {
  computeExerciseProgress,
  computeSessionProgress,
  getSetExecution,
} from "./sessionExecutionState";
import { isWorkingSet } from "./sessionSetFlow";

export interface BuildWorkoutSessionSummaryOptions {
  /** ISO-8601 timestamp when the athlete entered the session screen. */
  readonly startedAt: string;
  /** ISO-8601 timestamp when Finish Workout was pressed. Defaults to now. */
  readonly completedAt?: string;
  /** Optional clock for tests. */
  readonly now?: () => Date;
}

/**
 * Application/presentation mapper: immutable session + local execution overlay
 * → `WorkoutSessionSummary`. Pure — no persistence, sync, or session mutation.
 */
export function buildWorkoutSessionSummary(
  session: WorkoutSession,
  execution: SessionExecutionState,
  options: BuildWorkoutSessionSummaryOptions,
): WorkoutSessionSummary {
  const completedAt = options.completedAt ?? (options.now?.() ?? new Date()).toISOString();
  const progress = computeSessionProgress(session, execution);

  let completedExercises = 0;
  for (const exercise of session.exercises) {
    const exerciseProgress = computeExerciseProgress(exercise, execution);
    if (exerciseProgress.isComplete && exerciseProgress.completedSets > 0) {
      completedExercises += 1;
    }
  }

  let estimatedVolumeKg = 0;
  let workingRepsSum = 0;
  let workingRepsCount = 0;
  const exercises: CompletedWorkoutExercise[] = [];

  for (const exercise of session.exercises) {
    const completedSets: CompletedWorkoutExercise["sets"][number][] = [];

    for (const set of exercise.sets) {
      const state = getSetExecution(execution, set.id);
      if (state.status !== "completed") {
        continue;
      }

      const reps = state.completedReps ?? 0;
      const load = state.completedLoad ?? 0;
      estimatedVolumeKg += load * reps;

      if (isWorkingSet(set) && state.completedReps !== null) {
        workingRepsSum += state.completedReps;
        workingRepsCount += 1;
      }

      completedSets.push(
        Object.freeze({
          id: set.id,
          setNumber: set.order + 1,
          weightKg: load,
          reps,
        }),
      );
    }

    exercises.push(
      Object.freeze({
        id: exercise.id,
        name: exercise.name,
        order: exercise.order,
        sets: Object.freeze(completedSets),
      }),
    );
  }

  const averageCompletedReps =
    workingRepsCount > 0
      ? roundAverage(workingRepsSum / workingRepsCount)
      : null;

  return Object.freeze({
    sessionId: session.id,
    title: session.title,
    programName: session.programTitle.length > 0 ? session.programTitle : null,
    durationSeconds: computeDurationSeconds(options.startedAt, completedAt),
    completedExercises,
    totalExercises: session.exercises.length,
    completedSets: progress.completedSets,
    skippedSets: progress.skippedSets,
    totalSets: progress.totalSets,
    completionPercent: progress.percent,
    estimatedVolumeKg: roundVolume(estimatedVolumeKg),
    averageCompletedReps,
    completedAt,
    exercises: Object.freeze(exercises),
  });
}

function computeDurationSeconds(startedAt: string, completedAt: string): number {
  const startMs = Date.parse(startedAt);
  const endMs = Date.parse(completedAt);
  if (!Number.isFinite(startMs) || !Number.isFinite(endMs)) {
    return 0;
  }
  return Math.max(0, Math.round((endMs - startMs) / 1000));
}

function roundAverage(value: number): number {
  return Math.round(value * 10) / 10;
}

function roundVolume(value: number): number {
  return Math.round(value * 100) / 100;
}

import type { CompletedWorkout } from "../../workout/models/CompletedWorkout";
import type { WorkoutTrend } from "../models/WorkoutTrend";
import { roundToTwo } from "./round";
import {
  addUtcWeeks,
  enumerateWeekKeys,
  startOfUtcWeek,
  toUtcDateString,
  weekKeyFromIso,
} from "./weekBounds";

export interface TrendOptions {
  /** Number of UTC weeks ending at the reference week (inclusive). Default 8. */
  readonly weeks?: number;
  /** Anchor date for the newest week. */
  readonly referenceDate: Date;
}

function resolveWeekWindow(
  options: TrendOptions,
): { keys: readonly string[]; keySet: ReadonlySet<string> } {
  const weeks = Math.max(1, Math.floor(options.weeks ?? 8));
  const endMonday = startOfUtcWeek(options.referenceDate);
  const startMonday = addUtcWeeks(endMonday, -(weeks - 1));
  const keys = enumerateWeekKeys(startMonday, endMonday);
  return {
    keys,
    keySet: new Set(keys),
  };
}

function buildPoints(
  keys: readonly string[],
  values: Map<string, number>,
  round: boolean,
): WorkoutTrend["points"] {
  return Object.freeze(
    keys.map((periodStart) =>
      Object.freeze({
        periodStart,
        value: round
          ? roundToTwo(values.get(periodStart) ?? 0)
          : (values.get(periodStart) ?? 0),
      }),
    ),
  );
}

/** Weekly total volume (kg·reps) for the requested window. */
export function computeVolumeTrend(
  sessions: readonly CompletedWorkout[],
  options: TrendOptions,
): WorkoutTrend {
  const { keys, keySet } = resolveWeekWindow(options);
  const values = new Map<string, number>();
  for (const session of sessions) {
    const key = weekKeyFromIso(session.completedAt);
    if (!keySet.has(key)) {
      continue;
    }
    values.set(key, (values.get(key) ?? 0) + session.estimatedVolumeKg);
  }

  return Object.freeze({
    metric: "volume" as const,
    points: buildPoints(keys, values, true),
  });
}

/** Weekly workout count for the requested window. */
export function computeWorkoutFrequency(
  sessions: readonly CompletedWorkout[],
  options: TrendOptions,
): WorkoutTrend {
  const { keys, keySet } = resolveWeekWindow(options);
  const values = new Map<string, number>();
  for (const session of sessions) {
    const key = weekKeyFromIso(session.completedAt);
    if (!keySet.has(key)) {
      continue;
    }
    values.set(key, (values.get(key) ?? 0) + 1);
  }

  return Object.freeze({
    metric: "workout_frequency" as const,
    points: buildPoints(keys, values, false),
  });
}

/**
 * Weekly count of sessions that included the given exercise
 * (at least one completed set in the exercise snapshot).
 */
export function computeExerciseFrequency(
  sessions: readonly CompletedWorkout[],
  exerciseId: string,
  options: TrendOptions,
): WorkoutTrend {
  const { keys, keySet } = resolveWeekWindow(options);
  const values = new Map<string, number>();

  for (const session of sessions) {
    const key = weekKeyFromIso(session.completedAt);
    if (!keySet.has(key)) {
      continue;
    }
    const performed = session.exercises.some(
      (exercise) =>
        exercise.id === exerciseId && exercise.sets.length > 0,
    );
    if (!performed) {
      continue;
    }
    values.set(key, (values.get(key) ?? 0) + 1);
  }

  return Object.freeze({
    metric: "exercise_frequency" as const,
    points: buildPoints(keys, values, false),
  });
}

/** Expose Monday key helper for tests. */
export function trendWindowStart(
  referenceDate: Date,
  weeks: number,
): string {
  const endMonday = startOfUtcWeek(referenceDate);
  const startMonday = addUtcWeeks(endMonday, -(Math.max(1, weeks) - 1));
  return toUtcDateString(startMonday);
}

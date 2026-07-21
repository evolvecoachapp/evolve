import type { CompletedWorkout } from "../../workout/models/CompletedWorkout";
import { calculateSetVolume } from "../../workout/utils/setVolume";
import type { ExerciseAnalytics } from "../models/ExerciseAnalytics";
import { roundToTwo } from "./round";

interface ExerciseAccumulator {
  exerciseId: string;
  exerciseName: string;
  bestWeightKg: number;
  bestVolumeKg: number;
  totalReps: number;
  setCount: number;
  sessionIds: Set<string>;
  lastPerformedAt: string | null;
}

function createAccumulator(
  exerciseId: string,
  exerciseName: string,
): ExerciseAccumulator {
  return {
    exerciseId,
    exerciseName,
    bestWeightKg: 0,
    bestVolumeKg: 0,
    totalReps: 0,
    setCount: 0,
    sessionIds: new Set(),
    lastPerformedAt: null,
  };
}

function toAnalytics(acc: ExerciseAccumulator): ExerciseAnalytics {
  const hasSets = acc.setCount > 0;
  return Object.freeze({
    exerciseId: acc.exerciseId,
    exerciseName: acc.exerciseName,
    bestWeightKg: hasSets ? roundToTwo(acc.bestWeightKg) : null,
    bestVolumeKg: hasSets ? roundToTwo(acc.bestVolumeKg) : null,
    averageReps: hasSets
      ? roundToTwo(acc.totalReps / acc.setCount)
      : null,
    sessionsPerformed: acc.sessionIds.size,
    lastPerformedAt: acc.lastPerformedAt,
  });
}

/**
 * Per-exercise analytics across all sessions.
 * Sessions without exercise snapshots contribute nothing.
 * Sorted by sessionsPerformed desc, then name asc.
 */
export function computeExerciseAnalytics(
  sessions: readonly CompletedWorkout[],
): readonly ExerciseAnalytics[] {
  const byId = new Map<string, ExerciseAccumulator>();

  for (const session of sessions) {
    for (const exercise of session.exercises) {
      if (exercise.sets.length === 0) {
        continue;
      }

      let acc = byId.get(exercise.id);
      if (!acc) {
        acc = createAccumulator(exercise.id, exercise.name);
        byId.set(exercise.id, acc);
      } else if (exercise.name.length > 0) {
        // Prefer the most recently seen non-empty name
        acc.exerciseName = exercise.name;
      }

      acc.sessionIds.add(session.id);

      if (
        acc.lastPerformedAt == null ||
        session.completedAt > acc.lastPerformedAt
      ) {
        acc.lastPerformedAt = session.completedAt;
      }

      for (const set of exercise.sets) {
        const volume = calculateSetVolume(set.weightKg, set.reps);
        if (set.weightKg > acc.bestWeightKg) {
          acc.bestWeightKg = set.weightKg;
        }
        if (volume > acc.bestVolumeKg) {
          acc.bestVolumeKg = volume;
        }
        acc.totalReps += set.reps;
        acc.setCount += 1;
      }
    }
  }

  return Object.freeze(
    [...byId.values()]
      .map(toAnalytics)
      .sort((a, b) => {
        if (b.sessionsPerformed !== a.sessionsPerformed) {
          return b.sessionsPerformed - a.sessionsPerformed;
        }
        return a.exerciseName.localeCompare(b.exerciseName);
      }),
  );
}

/** Single-exercise analytics, or `null` when the exercise never appears. */
export function computeExerciseAnalyticsForId(
  sessions: readonly CompletedWorkout[],
  exerciseId: string,
): ExerciseAnalytics | null {
  const match = computeExerciseAnalytics(sessions).find(
    (entry) => entry.exerciseId === exerciseId,
  );
  return match ?? null;
}

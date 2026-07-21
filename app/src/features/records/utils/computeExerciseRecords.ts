import type { CompletedWorkout } from "../../workout/models/CompletedWorkout";
import { calculateSetVolume } from "../../workout/utils/setVolume";
import type { EstimatedOneRM } from "../models/EstimatedOneRM";
import type { ExerciseRecord } from "../models/ExerciseRecord";
import { estimateOneRMEpley } from "./epley";
import { roundToTwo } from "./round";

interface ExerciseAccumulator {
  exerciseId: string;
  exerciseName: string;
  bestWeightKg: number;
  bestEstimatedOneRM: EstimatedOneRM | null;
  bestSingleSetVolumeKg: number;
  bestReps: number;
  setCount: number;
  lastRecordAt: string | null;
}

function createAccumulator(
  exerciseId: string,
  exerciseName: string,
): ExerciseAccumulator {
  return {
    exerciseId,
    exerciseName,
    bestWeightKg: 0,
    bestEstimatedOneRM: null,
    bestSingleSetVolumeKg: 0,
    bestReps: 0,
    setCount: 0,
    lastRecordAt: null,
  };
}

function toRecord(acc: ExerciseAccumulator): ExerciseRecord {
  const hasSets = acc.setCount > 0;
  return Object.freeze({
    exerciseId: acc.exerciseId,
    exerciseName: acc.exerciseName,
    bestWeightKg: hasSets ? roundToTwo(acc.bestWeightKg) : null,
    bestEstimatedOneRM: acc.bestEstimatedOneRM,
    bestSingleSetVolumeKg: hasSets
      ? roundToTwo(acc.bestSingleSetVolumeKg)
      : null,
    bestReps: hasSets ? acc.bestReps : null,
    lastRecordAt: acc.lastRecordAt,
  });
}

/**
 * Per-exercise personal records across all sessions.
 * Sorted by best estimated 1RM desc, then name asc.
 */
export function computeExerciseRecords(
  sessions: readonly CompletedWorkout[],
): readonly ExerciseRecord[] {
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
        acc.exerciseName = exercise.name;
      }

      if (
        acc.lastRecordAt == null ||
        session.completedAt > acc.lastRecordAt
      ) {
        acc.lastRecordAt = session.completedAt;
      }

      for (const set of exercise.sets) {
        const volume = calculateSetVolume(set.weightKg, set.reps);
        const estimatedKg = estimateOneRMEpley(set.weightKg, set.reps);

        if (set.weightKg > acc.bestWeightKg) {
          acc.bestWeightKg = set.weightKg;
        }
        if (volume > acc.bestSingleSetVolumeKg) {
          acc.bestSingleSetVolumeKg = volume;
        }
        if (set.reps > acc.bestReps) {
          acc.bestReps = set.reps;
        }
        if (
          estimatedKg > 0 &&
          (acc.bestEstimatedOneRM == null ||
            estimatedKg > acc.bestEstimatedOneRM.estimatedKg)
        ) {
          acc.bestEstimatedOneRM = Object.freeze({
            exerciseId: exercise.id,
            exerciseName: exercise.name.length > 0 ? exercise.name : acc.exerciseName,
            weightKg: roundToTwo(set.weightKg),
            reps: set.reps,
            estimatedKg,
            achievedAt: session.completedAt,
          });
        }

        acc.setCount += 1;
      }
    }
  }

  return Object.freeze(
    [...byId.values()]
      .map(toRecord)
      .sort((a, b) => {
        const aOneRm = a.bestEstimatedOneRM?.estimatedKg ?? 0;
        const bOneRm = b.bestEstimatedOneRM?.estimatedKg ?? 0;
        if (bOneRm !== aOneRm) {
          return bOneRm - aOneRm;
        }
        return a.exerciseName.localeCompare(b.exerciseName);
      }),
  );
}

/** Single-exercise record, or `null` when the exercise never appears. */
export function computeExerciseRecordForId(
  sessions: readonly CompletedWorkout[],
  exerciseId: string,
): ExerciseRecord | null {
  const match = computeExerciseRecords(sessions).find(
    (entry) => entry.exerciseId === exerciseId,
  );
  return match ?? null;
}

import type { CompletedWorkout } from "../../workout/models/CompletedWorkout";
import { calculateSetVolume } from "../../workout/utils/setVolume";
import type { WorkoutRecord } from "../models/WorkoutRecord";
import { estimateOneRMEpley } from "./epley";
import { roundToTwo } from "./round";

/**
 * Cross-exercise lifetime personal record highlights.
 */
export function computeWorkoutRecord(
  sessions: readonly CompletedWorkout[],
): WorkoutRecord {
  if (sessions.length === 0) {
    return Object.freeze({
      bestWeightKg: null,
      bestEstimatedOneRMKg: null,
      bestSessionVolumeKg: null,
      bestSingleSetVolumeKg: null,
      bestReps: null,
      lastRecordAt: null,
    });
  }

  let bestWeightKg = 0;
  let bestEstimatedOneRMKg = 0;
  let bestSessionVolumeKg = 0;
  let bestSingleSetVolumeKg = 0;
  let bestReps = 0;
  let lastRecordAt: string | null = null;
  let hasSets = false;

  for (const session of sessions) {
    if (session.estimatedVolumeKg > bestSessionVolumeKg) {
      bestSessionVolumeKg = session.estimatedVolumeKg;
    }

    if (lastRecordAt == null || session.completedAt > lastRecordAt) {
      lastRecordAt = session.completedAt;
    }

    for (const exercise of session.exercises) {
      for (const set of exercise.sets) {
        hasSets = true;
        const volume = calculateSetVolume(set.weightKg, set.reps);
        const estimatedKg = estimateOneRMEpley(set.weightKg, set.reps);

        if (set.weightKg > bestWeightKg) {
          bestWeightKg = set.weightKg;
        }
        if (estimatedKg > bestEstimatedOneRMKg) {
          bestEstimatedOneRMKg = estimatedKg;
        }
        if (volume > bestSingleSetVolumeKg) {
          bestSingleSetVolumeKg = volume;
        }
        if (set.reps > bestReps) {
          bestReps = set.reps;
        }
      }
    }
  }

  if (!hasSets) {
    return Object.freeze({
      bestWeightKg: null,
      bestEstimatedOneRMKg: null,
      bestSessionVolumeKg: roundToTwo(bestSessionVolumeKg),
      bestSingleSetVolumeKg: null,
      bestReps: null,
      lastRecordAt,
    });
  }

  return Object.freeze({
    bestWeightKg: roundToTwo(bestWeightKg),
    bestEstimatedOneRMKg: roundToTwo(bestEstimatedOneRMKg),
    bestSessionVolumeKg: roundToTwo(bestSessionVolumeKg),
    bestSingleSetVolumeKg: roundToTwo(bestSingleSetVolumeKg),
    bestReps,
    lastRecordAt,
  });
}

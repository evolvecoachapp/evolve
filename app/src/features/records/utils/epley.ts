import { roundToTwo } from "./round";

/**
 * Epley estimated one-rep max.
 *
 * Formula: weight × (1 + reps / 30)
 *
 * Isolated domain util — presentation must not inline this math.
 */
export function estimateOneRMEpley(weightKg: number, reps: number): number {
  const load = Number.isFinite(weightKg) ? Math.max(0, weightKg) : 0;
  const completedReps = Number.isFinite(reps) ? Math.max(0, reps) : 0;

  if (load === 0 || completedReps === 0) {
    return 0;
  }

  // Single-rep sets are already a true 1RM.
  if (completedReps === 1) {
    return roundToTwo(load);
  }

  return roundToTwo(load * (1 + completedReps / 30));
}

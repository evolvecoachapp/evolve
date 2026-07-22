import type { WorkoutBlueprint } from "../models/WorkoutBlueprint";
import type { TrainingFocusArea } from "../models/TrainingFocus";

/**
 * Relative weekly volume share per focus area (sums to ~1 for training days).
 * Pure metric — no formatting.
 */
export function calculateWeeklyVolumeDistribution(
  blueprint: WorkoutBlueprint,
): Readonly<Record<string, number>> {
  const trainingDays = blueprint.days.filter((day) => !day.isRestDay);
  if (trainingDays.length === 0) {
    return Object.freeze({});
  }

  const counts = new Map<TrainingFocusArea, number>();
  for (const day of trainingDays) {
    counts.set(day.focus.primary, (counts.get(day.focus.primary) ?? 0) + 1);
    if (day.focus.secondary) {
      counts.set(
        day.focus.secondary,
        (counts.get(day.focus.secondary) ?? 0) + 0.5,
      );
    }
  }

  const total = [...counts.values()].reduce((sum, value) => sum + value, 0);
  const distribution: Record<string, number> = {};
  for (const [area, count] of counts) {
    distribution[area] = total > 0 ? count / total : 0;
  }

  return Object.freeze(distribution);
}

import type { WorkoutBlueprint } from "../models/WorkoutBlueprint";

/**
 * Effective weekly training frequency from blueprint structure.
 * Pure metric — no formatting.
 */
export function calculateTrainingFrequency(
  blueprint: WorkoutBlueprint,
): number {
  const trainingDays = blueprint.days.filter((day) => !day.isRestDay).length;
  if (trainingDays > 0) {
    return trainingDays;
  }
  return blueprint.weeklyFrequency;
}

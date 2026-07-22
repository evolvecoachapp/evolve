import type { WorkoutDayBlueprint } from "../models/WorkoutDayBlueprint";

/**
 * Estimate relative session complexity from strategic day fields.
 * Pure metric — no formatting. Higher means denser session intent.
 */
export function estimateSessionComplexity(day: WorkoutDayBlueprint): number {
  if (day.isRestDay || day.sessionGoal === "rest") {
    return 0;
  }

  let complexity = 1;

  if (day.focus.secondary) {
    complexity += 1;
  }

  switch (day.sessionGoal) {
    case "primary_lift_emphasis":
      complexity += 2;
      break;
    case "volume_accumulation":
      complexity += 2;
      break;
    case "technique_practice":
      complexity += 1;
      break;
    case "conditioning":
      complexity += 1;
      break;
    case "recovery_stimulus":
      complexity += 0;
      break;
    case "balanced_development":
      complexity += 1;
      break;
  }

  if (
    typeof day.estimatedDurationMinutes === "number" &&
    day.estimatedDurationMinutes >= 75
  ) {
    complexity += 1;
  }

  return complexity;
}

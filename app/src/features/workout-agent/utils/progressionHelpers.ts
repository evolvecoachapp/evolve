import type { WorkoutObjective } from "../models/WorkoutObjective";
import { WorkoutObjectives } from "../models/WorkoutObjective";

/** Progression helpers (deterministic cues only). */

export function progressionCueFor(
  objective: WorkoutObjective,
  deload: boolean,
): string {
  if (deload) return "Reduce load 40–60% and prioritize technique.";
  switch (objective) {
    case WorkoutObjectives.STRENGTH:
    case WorkoutObjectives.POWERLIFTING:
      return "Add small load increments when all prescribed reps are completed.";
    case WorkoutObjectives.HYPERTROPHY:
      return "Progress reps first, then load when top of rep range is hit.";
    case WorkoutObjectives.POWERBUILDING:
      return "Alternate strength increments with hypertrophy volume blocks.";
    case WorkoutObjectives.RECOVERY:
      return "Hold load steady; emphasize movement quality.";
    default:
      return "Progress gradually while monitoring recovery.";
  }
}

export function shouldRecommendDeload(
  fatigueScore: number,
  recoveryFlag: boolean,
): boolean {
  return recoveryFlag || fatigueScore >= 0.85;
}

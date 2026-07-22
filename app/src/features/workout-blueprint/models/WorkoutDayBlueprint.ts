import type { SessionGoalCode } from "./SessionGoal";
import type { TrainingFocus } from "./TrainingFocus";

/**
 * Single-day strategic blueprint within a microcycle.
 *
 * No exercises, sets, reps, RPE, or percentages.
 */
export interface WorkoutDayBlueprint {
  readonly id: string;
  /** Zero-based index within the cycle. */
  readonly dayIndex: number;
  readonly name: string;
  readonly isRestDay: boolean;
  readonly focus: TrainingFocus;
  readonly sessionGoal: SessionGoalCode;
  /** Optional estimated session length in minutes. */
  readonly estimatedDurationMinutes: number | null;
}

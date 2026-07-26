import type { WorkoutDay } from "./WorkoutDay";

/**
 * Immutable microcycle within a WorkoutPlan.
 */
export interface WorkoutWeek {
  readonly id: string;
  readonly weekNumber: number;
  readonly label: string;
  readonly theme: string;
  readonly days: readonly WorkoutDay[];
}

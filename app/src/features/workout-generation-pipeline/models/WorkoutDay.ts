import type { WorkoutSession } from "../../workout-assembly/models/WorkoutSession";

/**
 * Immutable training day within a WorkoutPlan week.
 */
export interface WorkoutDay {
  readonly id: string;
  readonly dayNumber: number;
  readonly label: string;
  readonly focus: string;
  readonly isRestDay: boolean;
  readonly estimatedDurationSeconds: number;
  readonly session: WorkoutSession | null;
}

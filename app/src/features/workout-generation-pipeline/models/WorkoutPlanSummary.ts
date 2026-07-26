/**
 * Compact immutable summary of a WorkoutPlan.
 */
export interface WorkoutPlanSummary {
  readonly title: string;
  readonly focus: string;
  readonly daysPerWeek: number;
  readonly estimatedDurationMinutes: number;
  readonly exerciseCount: number;
  readonly message: string;
}

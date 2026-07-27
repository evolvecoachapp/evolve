/**
 * Immutable Weekly Coach Report workout section.
 * Composed from Workout Pipeline + completed workouts + plan modifications + phase + compliance.
 * Presentation only. Never invent plan state.
 */
export interface WeeklyWorkoutReport {
  readonly present: boolean;
  readonly planId: string | null;
  readonly planName: string | null;
  readonly currentPhase: string | null;
  readonly weekNumber: number | null;
  readonly completedWorkoutCount: number;
  readonly modificationCount: number;
  readonly latestModificationSummary: string | null;
  readonly planLineageId: string | null;
  readonly planVersion: number | null;
  readonly complianceSummary: string | null;
  readonly summary: string;
}

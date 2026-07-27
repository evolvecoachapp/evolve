/**
 * Immutable Daily Brief workout section — composed from Workout Pipeline + Plan History.
 * Presentation only. Never invent plan state.
 */
export interface DailyBriefWorkout {
  readonly present: boolean;
  readonly planId: string | null;
  readonly planName: string | null;
  readonly currentPhase: string | null;
  readonly weekNumber: number | null;
  readonly latestModificationSummary: string | null;
  readonly planLineageId: string | null;
  readonly planVersion: number | null;
  readonly summary: string;
}

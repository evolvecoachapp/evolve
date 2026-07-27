/**
 * Immutable Home goal card — composed from Goal Progress.
 * Presentation only. Never invent progress.
 */
export interface HomeGoalMilestoneRef {
  readonly id: string;
  readonly category: string;
  readonly subjectId: string;
}

export interface HomeGoalCard {
  readonly present: boolean;
  readonly goalId: string | null;
  readonly category: string | null;
  readonly progressSummary: string | null;
  readonly milestones: readonly HomeGoalMilestoneRef[];
  readonly severity: string | null;
  readonly summary: string;
}

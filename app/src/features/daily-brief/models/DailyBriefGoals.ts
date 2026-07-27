/**
 * Immutable Daily Brief goals section — composed from Goal Progress.
 * Presentation only. Never invent progress.
 */
export interface DailyBriefGoalMilestoneRef {
  readonly id: string;
  readonly category: string;
  readonly subjectId: string;
}

export interface DailyBriefGoals {
  readonly present: boolean;
  readonly goalId: string | null;
  readonly category: string | null;
  readonly progressSummary: string | null;
  readonly milestones: readonly DailyBriefGoalMilestoneRef[];
  readonly severity: string | null;
  readonly summary: string;
}

/**
 * Immutable Weekly Coach Report goal section.
 * Composed from Goal Progress — milestones, progress, remaining objectives.
 * Presentation only. Never invent progress.
 */
export interface WeeklyGoalMilestoneRef {
  readonly id: string;
  readonly category: string;
  readonly subjectId: string;
}

export interface WeeklyGoalReport {
  readonly present: boolean;
  readonly goalId: string | null;
  readonly category: string | null;
  readonly progressSummary: string | null;
  readonly milestones: readonly WeeklyGoalMilestoneRef[];
  readonly remainingObjectiveCount: number;
  readonly severity: string | null;
  readonly summary: string;
}

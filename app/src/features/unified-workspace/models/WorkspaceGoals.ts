import type { GoalProgress } from "../../goal-progress/models/GoalProgress";

/**
 * Immutable goals projection from Goal Progress and Home goal card.
 */
export interface WorkspaceGoals {
  readonly athleteId: string;
  readonly present: boolean;
  readonly goalProgress: GoalProgress | null;
  readonly goalId: string | null;
  readonly category: string | null;
  readonly progressSummary: string | null;
  readonly severity: string | null;
  readonly milestoneIds: readonly string[];
  readonly summary: string;
}

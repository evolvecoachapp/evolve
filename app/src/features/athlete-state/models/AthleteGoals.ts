/**
 * Immutable goals slice.
 */
export interface AthleteGoalItem {
  readonly id: string;
  readonly kind: string;
  readonly title: string;
  readonly status: string;
  readonly targetDate: string | null;
  readonly notes: readonly string[];
}

export interface AthleteGoals {
  readonly primaryGoalId: string | null;
  readonly items: readonly AthleteGoalItem[];
  readonly sourceAgentIds: readonly string[];
}

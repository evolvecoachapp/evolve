export interface GoalProgress {
  readonly id: string;
  readonly title: string;
  readonly category: string;
  readonly currentValue: number;
  readonly targetValue: number;
  readonly unit: string;
  readonly completionPercent: number;
  readonly status: string;
  readonly destination: string | null;
}

export function createGoalProgress(input: GoalProgress): GoalProgress {
  return Object.freeze({ ...input });
}

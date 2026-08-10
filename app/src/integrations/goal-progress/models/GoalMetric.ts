/** Immutable goal metric representation — no calculations. */
export interface GoalMetric {
  readonly key: string;
  readonly label: string;
  readonly value: number;
  readonly unit: string;
}

export function createGoalMetric(input: GoalMetric): GoalMetric {
  return Object.freeze({ ...input });
}

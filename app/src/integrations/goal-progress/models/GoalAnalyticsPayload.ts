import type { GoalMetric } from "./GoalMetric";

/** Immutable analytics payload projected from goal domain state. */
export interface GoalAnalyticsPayload {
  readonly goalId: string;
  readonly snapshotId: string | null;
  readonly title: string | null;
  readonly category: string | null;
  readonly currentValue: number | null;
  readonly targetValue: number | null;
  readonly unit: string | null;
  readonly completionPercent: number | null;
  readonly status: string | null;
  readonly evaluatedAt: string | null;
  readonly completedAt: string | null;
  readonly metrics: readonly GoalMetric[];
}

export function createGoalAnalyticsPayload(
  input: GoalAnalyticsPayload,
): GoalAnalyticsPayload {
  return Object.freeze({
    ...input,
    metrics: Object.freeze([...input.metrics]),
  });
}

export function createEmptyGoalAnalyticsPayload(
  goalId: string,
): GoalAnalyticsPayload {
  return createGoalAnalyticsPayload({
    goalId,
    snapshotId: null,
    title: null,
    category: null,
    currentValue: null,
    targetValue: null,
    unit: null,
    completionPercent: null,
    status: null,
    evaluatedAt: null,
    completedAt: null,
    metrics: [],
  });
}

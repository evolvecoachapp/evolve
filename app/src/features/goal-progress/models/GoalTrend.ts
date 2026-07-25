import type { GoalMetadata } from "./GoalMetadata";

export interface GoalTrend {
  readonly id: string;
  readonly startAt: string;
  readonly endAt: string;
  readonly itemIds: readonly string[];
  readonly metadata: GoalMetadata;
}

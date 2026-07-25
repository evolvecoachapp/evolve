import type { GoalMetadata } from "./GoalMetadata";

export interface GoalDependency {
  readonly id: string;
  readonly fromId: string;
  readonly toId: string;
  readonly kind: string;
  readonly metadata: GoalMetadata;
}

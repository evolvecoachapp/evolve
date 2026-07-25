import type { GoalMetadata } from "./GoalMetadata";

export interface GoalReference {
  readonly id: string;
  readonly adaptationId: string;
  readonly key: string;
  readonly kind: string;
  readonly metadata: GoalMetadata;
}

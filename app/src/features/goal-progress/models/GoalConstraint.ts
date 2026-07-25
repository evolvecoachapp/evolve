import type { GoalMetadata } from "./GoalMetadata";

export interface GoalConstraint {
  readonly id: string;
  readonly key: string;
  readonly subjectId: string;
  readonly subjectKeys: readonly string[];
  readonly metadata: GoalMetadata;
}

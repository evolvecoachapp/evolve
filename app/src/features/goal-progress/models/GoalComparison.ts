import type { GoalMetadata } from "./GoalMetadata";

/** Immutable key-diff comparison result — comparison only. */
export interface GoalComparison {
  readonly id: string;
  readonly leftId: string;
  readonly rightId: string;
  readonly addedKeys: readonly string[];
  readonly removedKeys: readonly string[];
  readonly sharedKeys: readonly string[];
  readonly metadata: GoalMetadata;
  readonly createdAt: string;
}

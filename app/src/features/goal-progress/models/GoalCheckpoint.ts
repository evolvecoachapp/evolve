import type { GoalCategory } from "./GoalCategory";
import type { GoalMetadata } from "./GoalMetadata";
import type { GoalPriority } from "./GoalPriority";

export interface GoalCheckpoint {
  readonly id: string;
  readonly category: GoalCategory;
  readonly subjectId: string;
  readonly triggerIds: readonly string[];
  readonly signalKeys: readonly string[];
  readonly priority: GoalPriority;
  readonly metadata: GoalMetadata;
}

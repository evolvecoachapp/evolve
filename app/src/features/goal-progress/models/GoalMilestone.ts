import type { GoalCategory } from "./GoalCategory";
import type { GoalMetadata } from "./GoalMetadata";
import type { GoalRisk } from "./GoalRisk";

export interface GoalMilestone {
  readonly id: string;
  readonly category: GoalCategory;
  readonly subjectId: string;
  readonly candidateIds: readonly string[];
  readonly signalKeys: readonly string[];
  readonly severity: GoalRisk;
  readonly metadata: GoalMetadata;
}

import type { GoalMetadata } from "./GoalMetadata";
import type { GoalPriority } from "./GoalPriority";
import type { GoalRisk } from "./GoalRisk";

export interface GoalEvaluation {
  readonly id: string;
  readonly subjectId: string;
  readonly priority: GoalPriority;
  readonly severity: GoalRisk;
  readonly riskOrdinal: number;
  readonly consistencyOrdinal: number;
  readonly dependencyCount: number;
  readonly signalKeys: readonly string[];
  readonly metadata: GoalMetadata;
}

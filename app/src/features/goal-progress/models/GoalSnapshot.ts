import type { GoalProgress } from "./GoalProgress";
import type { GoalMetadata } from "./GoalMetadata";
import type { GoalSummary } from "./GoalSummary";

export interface GoalSnapshot {
  readonly id: string;
  readonly athleteId: string;
  readonly contextId: string;
  readonly decisions: readonly GoalProgress[];
  readonly summary: GoalSummary | null;
  readonly signalKeys: readonly string[];
  readonly metadata: GoalMetadata;
  readonly createdAt: string;
}

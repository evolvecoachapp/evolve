import type { GoalMetadata } from "./GoalMetadata";

export interface GoalSummary {
  readonly id: string;
  readonly athleteId: string;
  readonly contextId: string;
  readonly decisionCount: number;
  readonly opportunityCount: number;
  readonly triggerCount: number;
  readonly categoryKeys: readonly string[];
  readonly signalKeys: readonly string[];
  readonly metadata: GoalMetadata;
  readonly createdAt: string;
}

import type { GoalMetadata } from "./GoalMetadata";

export interface GoalHistoryEntry {
  readonly id: string;
  readonly subjectId: string;
  readonly kind: string;
  readonly at: string;
  readonly signalKeys: readonly string[];
  readonly metadata: GoalMetadata;
}

export interface GoalHistory {
  readonly id: string;
  readonly athleteId: string;
  readonly entries: readonly GoalHistoryEntry[];
  readonly metadata: GoalMetadata;
  readonly createdAt: string;
}

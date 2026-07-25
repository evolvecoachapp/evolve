import type { GoalMetadata } from "./GoalMetadata";

export interface GoalDeviation {
  readonly id: string;
  readonly key: string;
  readonly subjectId: string;
  readonly met: boolean;
  readonly signalKeys: readonly string[];
  readonly metadata: GoalMetadata;
}

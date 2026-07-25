import type { GoalMetadata } from "./GoalMetadata";

export interface GoalTimelineItem {
  readonly id: string;
  readonly subjectId: string;
  readonly operation: string;
  readonly at: string;
  readonly metadata: GoalMetadata;
}

export interface GoalTimeline {
  readonly id: string;
  readonly athleteId: string;
  readonly items: readonly GoalTimelineItem[];
  readonly metadata: GoalMetadata;
  readonly createdAt: string;
}

import type { WorkoutMetadata } from "./WorkoutMetadata";

export interface WorkoutTimelineItem {
  readonly id: string;
  readonly adaptationId: string;
  readonly keys: readonly string[];
  readonly createdAt: string;
}

export interface WorkoutTimeline {
  readonly id: string;
  readonly athleteId: string;
  readonly items: readonly WorkoutTimelineItem[];
  readonly metadata: WorkoutMetadata;
  readonly createdAt: string;
}

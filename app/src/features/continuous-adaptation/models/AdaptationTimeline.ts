import type { AdaptationMetadata } from "./AdaptationMetadata";

export interface AdaptationTimelineItem {
  readonly id: string;
  readonly subjectId: string;
  readonly operation: string;
  readonly at: string;
  readonly metadata: AdaptationMetadata;
}

export interface AdaptationTimeline {
  readonly id: string;
  readonly athleteId: string;
  readonly items: readonly AdaptationTimelineItem[];
  readonly metadata: AdaptationMetadata;
  readonly createdAt: string;
}

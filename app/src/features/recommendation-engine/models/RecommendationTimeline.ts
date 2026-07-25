import type { RecommendationMetadata } from "./RecommendationMetadata";

export interface RecommendationTimelineItem {
  readonly id: string;
  readonly at: string;
  readonly kind: string;
  readonly subjectId: string;
  readonly note: string;
  readonly metadata: RecommendationMetadata;
}

export interface RecommendationTimeline {
  readonly id: string;
  readonly items: readonly RecommendationTimelineItem[];
  readonly createdAt: string;
}

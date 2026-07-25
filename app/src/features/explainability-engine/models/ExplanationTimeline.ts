import type { ExplanationMetadata } from "./ExplanationMetadata";

export interface ExplanationTimelineItem {
  readonly id: string;
  readonly subjectId: string;
  readonly operation: string;
  readonly at: string;
  readonly metadata: ExplanationMetadata;
}

export interface ExplanationTimeline {
  readonly id: string;
  readonly items: readonly ExplanationTimelineItem[];
  readonly createdAt: string;
}

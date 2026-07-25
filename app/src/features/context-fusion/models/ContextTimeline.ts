import type { ContextMetadata } from "./ContextMetadata";
import type { ContextSourceKind } from "./ContextSource";

export const ContextTimelineEventKinds = {
  FUSED: "fused",
  MERGED: "merged",
  RESOLVED: "resolved",
  SNAPSHOT: "snapshot",
  VALIDATED: "validated",
} as const;

export type ContextTimelineEventKind =
  (typeof ContextTimelineEventKinds)[keyof typeof ContextTimelineEventKinds];

export interface ContextTimelineItem {
  readonly id: string;
  readonly kind: ContextTimelineEventKind;
  readonly sourceKind: ContextSourceKind | null;
  readonly label: string;
  readonly at: string;
  readonly notes: readonly string[];
}

/**
 * Immutable fusion timeline.
 */
export interface ContextTimeline {
  readonly items: readonly ContextTimelineItem[];
  readonly metadata: ContextMetadata;
}

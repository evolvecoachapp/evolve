import type { SessionEvent } from "./SessionEvent";
import type { SessionMetadata } from "./SessionMetadata";

export interface SessionTimelineItem {
  readonly id: string;
  readonly event: SessionEvent;
  readonly ordinal: number;
}

/**
 * Immutable chronological timeline of session events.
 */
export interface SessionTimeline {
  readonly id: string;
  readonly sessionId: string;
  readonly items: readonly SessionTimelineItem[];
  readonly metadata: SessionMetadata;
  readonly createdAt: string;
}

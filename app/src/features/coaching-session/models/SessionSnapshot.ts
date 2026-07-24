import type { SessionContext } from "./SessionContext";
import type { SessionMetadata } from "./SessionMetadata";
import type { SessionRequest } from "./SessionRequest";
import type { SessionResponse } from "./SessionResponse";
import type { SessionSummary } from "./SessionSummary";
import type { SessionTimeline } from "./SessionTimeline";

/**
 * Immutable point-in-time snapshot of a coaching session.
 */
export interface SessionSnapshot {
  readonly id: string;
  readonly sessionId: string;
  readonly request: SessionRequest | null;
  readonly context: SessionContext | null;
  readonly response: SessionResponse | null;
  readonly summary: SessionSummary | null;
  readonly timeline: SessionTimeline | null;
  readonly metadata: SessionMetadata;
  readonly createdAt: string;
  readonly frozenAt: string;
}

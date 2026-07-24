import type { SessionMetadata } from "./SessionMetadata";

export const SessionEventTypes = {
  SESSION_STARTED: "session_started",
  TURN_STARTED: "turn_started",
  SUPERVISOR_INVOKED: "supervisor_invoked",
  RESPONSE_BUILT: "response_built",
  CHECKPOINT_CREATED: "checkpoint_created",
  SESSION_CONTINUED: "session_continued",
  SESSION_ENDED: "session_ended",
  COMPLETED: "completed",
  FAILED: "failed",
} as const;

export type SessionEventType =
  (typeof SessionEventTypes)[keyof typeof SessionEventTypes];

export interface SessionEvent {
  readonly id: string;
  readonly type: SessionEventType;
  readonly sessionId: string;
  readonly requestId: string | null;
  readonly message: string | null;
  readonly metadata: SessionMetadata;
  readonly occurredAt: string;
}

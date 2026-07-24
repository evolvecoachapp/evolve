import type { SessionMetadata } from "./SessionMetadata";
import type { SessionPhase } from "./SessionPhase";

export const SessionStatuses = {
  IDLE: "idle",
  STARTING: "starting",
  ACTIVE: "active",
  CONTINUING: "continuing",
  ENDING: "ending",
  COMPLETED: "completed",
  FAILED: "failed",
} as const;

export type SessionStatus =
  (typeof SessionStatuses)[keyof typeof SessionStatuses];

/**
 * Frozen coaching session state snapshot.
 */
export interface SessionState {
  readonly id: string;
  readonly sessionId: string;
  readonly status: SessionStatus;
  readonly phase: SessionPhase;
  readonly turnCount: number;
  readonly lastRequestId: string | null;
  readonly errorMessage: string | null;
  readonly metadata: SessionMetadata;
  readonly updatedAt: string;
}

import type { SessionMetadata } from "./SessionMetadata";
import type { SessionPhase } from "./SessionPhase";
import type { SessionStatus } from "./SessionState";

export const SessionLifecycleStages = {
  CREATED: "created",
  STARTED: "started",
  ACTIVE: "active",
  CONTINUED: "continued",
  ENDED: "ended",
  FAILED: "failed",
} as const;

export type SessionLifecycleStage =
  (typeof SessionLifecycleStages)[keyof typeof SessionLifecycleStages];

/**
 * Immutable lifecycle descriptor for a coaching session.
 */
export interface SessionLifecycle {
  readonly id: string;
  readonly sessionId: string;
  readonly stage: SessionLifecycleStage;
  readonly status: SessionStatus;
  readonly phase: SessionPhase;
  readonly startedAt: string | null;
  readonly endedAt: string | null;
  readonly metadata: SessionMetadata;
  readonly updatedAt: string;
}

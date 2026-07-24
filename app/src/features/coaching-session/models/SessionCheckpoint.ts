import type { SessionMetadata } from "./SessionMetadata";
import type { SessionPhase } from "./SessionPhase";
import type { SessionStatus } from "./SessionState";

/**
 * Immutable checkpoint capturing session progress at a point in time.
 */
export interface SessionCheckpoint {
  readonly id: string;
  readonly sessionId: string;
  readonly turnCount: number;
  readonly status: SessionStatus;
  readonly phase: SessionPhase;
  readonly lastRequestId: string | null;
  readonly lastResponseId: string | null;
  readonly metadata: SessionMetadata;
  readonly createdAt: string;
  readonly frozenAt: string;
}

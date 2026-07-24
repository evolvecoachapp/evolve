import type { SessionCheckpoint } from "./SessionCheckpoint";
import type { SessionHistory } from "./SessionHistory";
import type { SessionLifecycle } from "./SessionLifecycle";
import type { SessionMetadata } from "./SessionMetadata";
import type { SessionRequest } from "./SessionRequest";
import type { SessionState } from "./SessionState";

/**
 * Immutable session context maintained across a coaching interaction.
 */
export interface SessionContext {
  readonly id: string;
  readonly sessionId: string;
  readonly conversationId: string | null;
  readonly athleteId: string | null;
  readonly request: SessionRequest | null;
  readonly state: SessionState;
  readonly lifecycle: SessionLifecycle;
  readonly history: SessionHistory;
  readonly checkpoint: SessionCheckpoint | null;
  readonly metadata: SessionMetadata;
  readonly createdAt: string;
  readonly frozenAt: string;
}

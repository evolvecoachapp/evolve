import type { SessionEvent } from "./SessionEvent";
import type { SessionMetadata } from "./SessionMetadata";
import type { SessionRequest } from "./SessionRequest";
import type { SessionResponse } from "./SessionResponse";

export interface SessionHistoryEntry {
  readonly id: string;
  readonly request: SessionRequest;
  readonly response: SessionResponse | null;
  readonly createdAt: string;
}

/**
 * Immutable ordered history of session turns.
 */
export interface SessionHistory {
  readonly id: string;
  readonly sessionId: string;
  readonly entries: readonly SessionHistoryEntry[];
  readonly events: readonly SessionEvent[];
  readonly metadata: SessionMetadata;
  readonly createdAt: string;
  readonly updatedAt: string;
}

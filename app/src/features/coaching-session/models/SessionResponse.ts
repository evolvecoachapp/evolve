import type { SessionConfidence } from "./SessionConfidence";
import type { SessionDiagnostics } from "./SessionDiagnostics";
import type { SessionMetadata } from "./SessionMetadata";

/**
 * Immutable coach-facing response produced for a session turn.
 */
export interface SessionResponse {
  readonly id: string;
  readonly sessionId: string;
  readonly requestId: string;
  readonly message: string;
  readonly sections: readonly string[];
  readonly agentIds: readonly string[];
  readonly capabilityIds: readonly string[];
  readonly confidence: SessionConfidence;
  readonly diagnostics: SessionDiagnostics;
  readonly metadata: SessionMetadata;
  readonly createdAt: string;
  readonly frozenAt: string;
}

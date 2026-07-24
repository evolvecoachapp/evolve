import type { SessionContext } from "./SessionContext";
import type { SessionError } from "./SessionError";
import type { SessionEvent } from "./SessionEvent";
import type { SessionMetadata } from "./SessionMetadata";
import type { SessionRequest } from "./SessionRequest";
import type { SessionResponse } from "./SessionResponse";
import type { SessionSnapshot } from "./SessionSnapshot";
import type { SessionSummary } from "./SessionSummary";
import type { SessionValidation } from "./SessionValidation";
import type { CoachingSession } from "./CoachingSession";

export const SessionOperationKinds = {
  START: "start",
  CONTINUE: "continue",
  END: "end",
  DESCRIBE: "describe",
  VALIDATE: "validate",
} as const;

export type SessionOperationKind =
  (typeof SessionOperationKinds)[keyof typeof SessionOperationKinds];

/**
 * Immutable primary output of Coaching Session Runtime operations.
 */
export interface SessionResult {
  readonly id: string;
  readonly operation: SessionOperationKind;
  readonly success: boolean;
  readonly message: string | null;
  readonly sessionId: string | null;
  readonly request: SessionRequest | null;
  readonly context: SessionContext | null;
  readonly response: SessionResponse | null;
  readonly summary: SessionSummary | null;
  readonly snapshot: SessionSnapshot | null;
  readonly descriptor: CoachingSession | null;
  readonly validation: SessionValidation;
  readonly error: SessionError | null;
  readonly events: readonly SessionEvent[];
  readonly metadata: SessionMetadata;
  readonly startedAt: string;
  readonly completedAt: string;
  readonly frozenAt: string;
}

import type { SessionMetadata } from "./SessionMetadata";

export const SessionRequestKinds = {
  START: "start",
  CONTINUE: "continue",
  END: "end",
  DESCRIBE: "describe",
  VALIDATE: "validate",
} as const;

export type SessionRequestKind =
  (typeof SessionRequestKinds)[keyof typeof SessionRequestKinds];

/**
 * Immutable request accepted by Coaching Session Runtime.
 * Orchestration input only — no domain payloads.
 */
export interface SessionRequest {
  readonly id: string;
  readonly kind: SessionRequestKind;
  readonly sessionId: string | null;
  readonly conversationId: string | null;
  readonly athleteId: string | null;
  readonly message: string;
  readonly intent: string;
  readonly requiredCapabilityIds: readonly string[];
  readonly metadata: SessionMetadata;
  readonly createdAt: string;
}

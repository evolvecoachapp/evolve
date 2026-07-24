import type { SessionMetadata } from "./SessionMetadata";
import type { SessionPhase } from "./SessionPhase";
import type { SessionStatus } from "./SessionState";

export const CoachingSessionCapabilityKinds = {
  START: "start_session",
  CONTINUE: "continue_session",
  END: "end_session",
  DESCRIBE: "describe_session",
  VALIDATE: "validate_session",
} as const;

export type CoachingSessionCapabilityKind =
  (typeof CoachingSessionCapabilityKinds)[keyof typeof CoachingSessionCapabilityKinds];

/**
 * Immutable descriptor of the Coaching Session Runtime.
 */
export interface CoachingSession {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly status: SessionStatus;
  readonly phase: SessionPhase;
  readonly capabilities: readonly CoachingSessionCapabilityKind[];
  readonly metadata: SessionMetadata;
  readonly createdAt: string;
}

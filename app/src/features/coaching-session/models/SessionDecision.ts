import type { SessionActionKind } from "./SessionAction";
import type { SessionConfidence } from "./SessionConfidence";
import type { SessionMetadata } from "./SessionMetadata";

export const SessionDecisionKinds = {
  START: "start",
  CONTINUE: "continue",
  END: "end",
  FAIL: "fail",
} as const;

export type SessionDecisionKind =
  (typeof SessionDecisionKinds)[keyof typeof SessionDecisionKinds];

export interface SessionDecision {
  readonly id: string;
  readonly kind: SessionDecisionKind;
  readonly nextAction: SessionActionKind;
  readonly confidence: SessionConfidence;
  readonly rationale: string | null;
  readonly metadata: SessionMetadata;
  readonly createdAt: string;
}

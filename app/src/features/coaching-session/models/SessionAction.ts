import type { SessionMetadata } from "./SessionMetadata";

export const SessionActionKinds = {
  START: "start",
  CONTINUE: "continue",
  END: "end",
  SUPERVISE: "supervise",
  CHECKPOINT: "checkpoint",
  SUMMARIZE: "summarize",
} as const;

export type SessionActionKind =
  (typeof SessionActionKinds)[keyof typeof SessionActionKinds];

export interface SessionAction {
  readonly id: string;
  readonly kind: SessionActionKind;
  readonly sessionId: string;
  readonly requestId: string | null;
  readonly label: string;
  readonly metadata: SessionMetadata;
  readonly createdAt: string;
}

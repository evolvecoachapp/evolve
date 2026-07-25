import type { ContextContribution } from "./ContextContribution";
import type { ContextMetadata } from "./ContextMetadata";
import type { UnifiedCoachingContext } from "./UnifiedCoachingContext";

export const ContextRequestKinds = {
  BUILD: "build",
  MERGE: "merge",
  VALIDATE: "validate",
  DESCRIBE: "describe",
  SNAPSHOT: "snapshot",
} as const;

export type ContextRequestKind =
  (typeof ContextRequestKinds)[keyof typeof ContextRequestKinds];

/**
 * Immutable request into the Context Fusion Engine.
 */
export interface ContextRequest {
  readonly id: string;
  readonly kind: ContextRequestKind;
  readonly athleteId: string;
  readonly sessionId: string | null;
  readonly conversationId: string | null;
  readonly contextId: string | null;
  readonly base: UnifiedCoachingContext | null;
  readonly contributions: readonly ContextContribution[];
  readonly reason: string | null;
  readonly metadata: ContextMetadata;
  readonly createdAt: string;
}

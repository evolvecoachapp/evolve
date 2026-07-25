import type { DecisionContext } from "./DecisionContext";
  import type { DecisionMetadata } from "./DecisionMetadata";
  import type { CoachingDecision } from "./CoachingDecision";

export const DecisionInputKinds = {
  BUILD: "build",
  EVALUATE: "evaluate",
  RESOLVE: "resolve",
  VALIDATE: "validate",
  DESCRIBE: "describe",
} as const;

export type DecisionInputKind =
  (typeof DecisionInputKinds)[keyof typeof DecisionInputKinds];

/**
 * Immutable request into Decision Engine operations.
 */
export interface DecisionInput {
  readonly id: string;
  readonly kind: DecisionInputKind;
  readonly athleteId: string;
  readonly sessionId: string | null;
  readonly conversationId: string | null;
  readonly contextId: string;
  readonly decisionContext: DecisionContext | null;
  readonly decisions: readonly CoachingDecision[];
  readonly reason: string;
  readonly metadata: DecisionMetadata;
  readonly createdAt: string;
}

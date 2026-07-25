import type { ContextDescriptor } from "./ContextDescriptor";
import type { ContextError } from "./ContextError";
import type { ContextPackage } from "./ContextPackage";
import type { ContextSnapshot } from "./ContextSnapshot";
import type { ContextSummary } from "./ContextSummary";
import type { ContextValidation } from "./ContextValidation";
import type { DecisionEngineContext } from "./DecisionEngineContext";
import type { UnifiedCoachingContext } from "./UnifiedCoachingContext";

export const ContextOperationKinds = {
  BUILD: "build",
  MERGE: "merge",
  VALIDATE: "validate",
  DESCRIBE: "describe",
  SNAPSHOT: "snapshot",
} as const;

export type ContextOperationKind =
  (typeof ContextOperationKinds)[keyof typeof ContextOperationKinds];

/**
 * Immutable result of a fusion operation.
 */
export interface ContextResult {
  readonly id: string;
  readonly operation: ContextOperationKind;
  readonly success: boolean;
  readonly message: string;
  readonly athleteId: string | null;
  readonly context: UnifiedCoachingContext | null;
  readonly snapshot: ContextSnapshot | null;
  readonly summary: ContextSummary | null;
  readonly package: ContextPackage | null;
  readonly decisionEngineContext: DecisionEngineContext | null;
  readonly descriptor: ContextDescriptor | null;
  readonly validation: ContextValidation | null;
  readonly error: ContextError | null;
  readonly startedAt: string;
  readonly completedAt: string;
}

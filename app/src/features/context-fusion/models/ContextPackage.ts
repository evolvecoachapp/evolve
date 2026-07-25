import type { ContextMetadata } from "./ContextMetadata";
import type { ContextSnapshot } from "./ContextSnapshot";
import type { ContextSummary } from "./ContextSummary";
import type { DecisionEngineContext } from "./DecisionEngineContext";
import type { UnifiedCoachingContext } from "./UnifiedCoachingContext";

/**
 * Immutable delivery package from fusion.
 */
export interface ContextPackage {
  readonly id: string;
  readonly context: UnifiedCoachingContext;
  readonly snapshot: ContextSnapshot | null;
  readonly summary: ContextSummary | null;
  readonly decisionEngineContext: DecisionEngineContext | null;
  readonly metadata: ContextMetadata;
  readonly createdAt: string;
}

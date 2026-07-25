import type { ContextMetadata } from "./ContextMetadata";
import type { ContextSummary } from "./ContextSummary";
import type { ContextVersion } from "./ContextVersion";
import type { UnifiedCoachingContext } from "./UnifiedCoachingContext";

/**
 * Immutable handoff package for the Decision Engine.
 * Representation only — no decisions computed here.
 */
export interface DecisionEngineContext {
  readonly id: string;
  readonly athleteId: string;
  readonly sessionId: string | null;
  readonly conversationId: string | null;
  readonly contextId: string;
  readonly version: ContextVersion;
  readonly context: UnifiedCoachingContext;
  readonly summary: ContextSummary | null;
  readonly focusAreas: readonly string[];
  readonly metadata: ContextMetadata;
  readonly createdAt: string;
}

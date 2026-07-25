import type { UnifiedCoachingContext } from "../../context-fusion/models/UnifiedCoachingContext";
  import type { DecisionEngineContext } from "../../context-fusion/models/DecisionEngineContext";
  import type { DecisionMetadata } from "./DecisionMetadata";

/**
 * Immutable input view for Decision Engine orchestration.
 */
export interface DecisionContext {
  readonly id: string;
  readonly athleteId: string;
  readonly sessionId: string | null;
  readonly conversationId: string | null;
  readonly contextId: string;
  readonly unified: UnifiedCoachingContext;
  readonly handoff: DecisionEngineContext | null;
  readonly focusAreas: readonly string[];
  readonly metadata: DecisionMetadata;
  readonly createdAt: string;
}

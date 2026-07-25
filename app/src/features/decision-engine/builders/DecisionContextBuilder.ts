import type { UnifiedCoachingContext } from "../../context-fusion/models/UnifiedCoachingContext";
import type { DecisionEngineContext } from "../../context-fusion/models/DecisionEngineContext";
import type { DecisionContext } from "../models/DecisionContext";
import { EMPTY_DECISION_METADATA } from "../models/DecisionMetadata";
import { freezeContext } from "../utils/FreezeDecisionState";

export function buildDecisionContext(input: {
  readonly id: string;
  readonly unified: UnifiedCoachingContext;
  readonly handoff: DecisionEngineContext | null;
  readonly at: string;
}): DecisionContext {
  return freezeContext({
    id: input.id,
    athleteId: input.unified.athleteId,
    sessionId: input.unified.sessionId,
    conversationId: input.unified.conversationId,
    contextId: input.unified.id,
    unified: input.unified,
    handoff: input.handoff,
    focusAreas: Object.freeze([
      ...(input.handoff?.focusAreas ?? ["orchestration"]),
    ]),
    metadata: EMPTY_DECISION_METADATA,
    createdAt: input.at,
  });
}

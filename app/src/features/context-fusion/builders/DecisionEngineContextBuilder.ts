import type { ContextSummary } from "../models/ContextSummary";
import type { DecisionEngineContext } from "../models/DecisionEngineContext";
import type { UnifiedCoachingContext } from "../models/UnifiedCoachingContext";
import { EMPTY_CONTEXT_METADATA } from "../models/ContextMetadata";
import { freezeDecisionEngineContext } from "../utils/FreezeContext";

export function buildDecisionEngineContext(input: {
  readonly id: string;
  readonly context: UnifiedCoachingContext;
  readonly summary?: ContextSummary | null;
  readonly createdAt: string;
}): DecisionEngineContext {
  const focusAreas = Object.freeze(
    [
      input.context.workout ? "workout" : null,
      input.context.nutrition ? "nutrition" : null,
      input.context.recovery ? "recovery" : null,
      input.context.goal ? "goal" : null,
      input.context.athlete ? "athlete" : null,
    ].filter((x): x is string => x !== null),
  );
  return freezeDecisionEngineContext({
    id: input.id,
    athleteId: input.context.athleteId,
    sessionId: input.context.sessionId,
    conversationId: input.context.conversationId,
    contextId: input.context.id,
    version: input.context.version,
    context: input.context,
    summary: input.summary ?? null,
    focusAreas,
    metadata: EMPTY_CONTEXT_METADATA,
    createdAt: input.createdAt,
  });
}

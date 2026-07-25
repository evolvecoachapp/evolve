import type { DecisionEngineContext } from "../../context-fusion/models/DecisionEngineContext";
import type { UnifiedCoachingContext } from "../../context-fusion/models/UnifiedCoachingContext";
import { buildEmptyUnifiedContext } from "../../context-fusion/builders/UnifiedContextBuilder";
import { EMPTY_CONTEXT_METADATA } from "../../context-fusion/models/ContextMetadata";
import { INITIAL_CONTEXT_VERSION } from "../../context-fusion/models/ContextVersion";

/**
 * Upstream Context Fusion contract — Decision Engine consumes fused context only.
 */
export interface ContextFusionPort {
  loadUnifiedContext(input: {
    readonly athleteId: string;
    readonly sessionId: string | null;
    readonly conversationId: string | null;
    readonly contextId: string;
    readonly at: string;
  }): UnifiedCoachingContext | null;

  loadDecisionEngineContext(input: {
    readonly athleteId: string;
    readonly sessionId: string | null;
    readonly conversationId: string | null;
    readonly contextId: string;
    readonly at: string;
  }): DecisionEngineContext | null;
}

export function createMockContextFusionPort(
  overrides: Partial<UnifiedCoachingContext> = {},
): ContextFusionPort {
  return {
    loadUnifiedContext(input) {
      const base = buildEmptyUnifiedContext({
        id: input.contextId,
        athleteId: input.athleteId,
        sessionId: input.sessionId,
        conversationId: input.conversationId,
        at: input.at,
      });
      const athlete = Object.freeze({
        id: "slice:athlete:mock",
        sourceKind: "athlete" as const,
        referenceId: input.athleteId,
        label: "athlete",
        facts: Object.freeze({ ready: true as const }),
        notes: Object.freeze([] as string[]),
        metadata: EMPTY_CONTEXT_METADATA,
        contributedAt: input.at,
      });
      const workout = Object.freeze({
        id: "slice:workout:mock",
        sourceKind: "workout" as const,
        referenceId: "workout:mock",
        label: "workout",
        facts: Object.freeze({ focus: "strength" as const }),
        notes: Object.freeze([] as string[]),
        metadata: EMPTY_CONTEXT_METADATA,
        contributedAt: input.at,
      });
      const recovery = Object.freeze({
        id: "slice:recovery:mock",
        sourceKind: "recovery" as const,
        referenceId: "recovery:mock",
        label: "recovery",
        facts: Object.freeze({ status: "available" as const }),
        notes: Object.freeze([] as string[]),
        metadata: EMPTY_CONTEXT_METADATA,
        contributedAt: input.at,
      });
      return Object.freeze({
        ...base,
        ...overrides,
        athlete: "athlete" in overrides ? overrides.athlete ?? null : athlete,
        workout: "workout" in overrides ? overrides.workout ?? null : workout,
        recovery: "recovery" in overrides ? overrides.recovery ?? null : recovery,
        sources: Object.freeze([
          Object.freeze({
            id: "source:athlete",
            kind: "athlete" as const,
            label: "athlete",
            referenceId: input.athleteId,
            version: INITIAL_CONTEXT_VERSION,
            available: true,
            notes: Object.freeze([] as string[]),
            metadata: EMPTY_CONTEXT_METADATA,
            contributedAt: input.at,
          }),
          Object.freeze({
            id: "source:workout",
            kind: "workout" as const,
            label: "workout",
            referenceId: "workout:mock",
            version: INITIAL_CONTEXT_VERSION,
            available: true,
            notes: Object.freeze([] as string[]),
            metadata: EMPTY_CONTEXT_METADATA,
            contributedAt: input.at,
          }),
          Object.freeze({
            id: "source:recovery",
            kind: "recovery" as const,
            label: "recovery",
            referenceId: "recovery:mock",
            version: INITIAL_CONTEXT_VERSION,
            available: true,
            notes: Object.freeze([] as string[]),
            metadata: EMPTY_CONTEXT_METADATA,
            contributedAt: input.at,
          }),
        ]),
      });
    },
    loadDecisionEngineContext(input) {
      const context = this.loadUnifiedContext(input);
      if (!context) return null;
      return Object.freeze({
        id: `dec-ctx:${input.contextId}`,
        athleteId: input.athleteId,
        sessionId: input.sessionId,
        conversationId: input.conversationId,
        contextId: input.contextId,
        version: context.version,
        context,
        summary: context.summary,
        focusAreas: Object.freeze(["training", "recovery"]),
        metadata: EMPTY_CONTEXT_METADATA,
        createdAt: input.at,
      });
    },
  };
}

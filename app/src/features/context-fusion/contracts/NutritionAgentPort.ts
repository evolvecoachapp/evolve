import type { ContextContribution } from "../models/ContextContribution";
import { EMPTY_CONTEXT_METADATA } from "../models/ContextMetadata";
import { ContextSourceKinds } from "../models/ContextSource";
import { freezeContribution } from "../utils/FreezeContext";

export interface NutritionAgentPort {
  contribute(input: {
    readonly athleteId: string;
    readonly sessionId?: string | null;
    readonly conversationId?: string | null;
    readonly agentId?: string;
    readonly at?: string;
  }): ContextContribution | null;
}

export function createMockNutritionAgentPort(
  contribution?: ContextContribution | null,
): NutritionAgentPort {
  return {
    contribute(input) {
      if (contribution === null) return null;
      if (contribution) return freezeContribution(contribution);
      const at = input.at ?? "2026-07-25T12:00:00.000Z";
      return freezeContribution({
        id: `contribution:nutrition:${input.athleteId}`,
        sourceKind: ContextSourceKinds.NUTRITION,
        agentId: input.agentId ?? "agent:nutrition",
        athleteId: input.athleteId,
        sessionId: input.sessionId ?? null,
        conversationId: input.conversationId ?? null,
        slice: Object.freeze({
          id: `slice:nutrition:${input.athleteId}`,
          sourceKind: ContextSourceKinds.NUTRITION,
          referenceId: null,
          label: "nutrition agent",
          facts: Object.freeze({"planId":"nutrition-plan:1","calorieTarget":2400} as Record<
            string,
            string | number | boolean | null
          >),
          notes: Object.freeze(["mock nutrition contribution"]),
          metadata: EMPTY_CONTEXT_METADATA,
          contributedAt: at,
        }),
        version: null,
        notes: Object.freeze(["mock nutrition agent port"]),
        metadata: EMPTY_CONTEXT_METADATA,
        contributedAt: at,
      });
    },
  };
}

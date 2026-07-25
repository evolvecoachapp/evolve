import type { ContextContribution } from "../models/ContextContribution";
import { EMPTY_CONTEXT_METADATA } from "../models/ContextMetadata";
import { ContextSourceKinds } from "../models/ContextSource";
import { freezeContribution } from "../utils/FreezeContext";

export interface GoalAgentPort {
  contribute(input: {
    readonly athleteId: string;
    readonly sessionId?: string | null;
    readonly conversationId?: string | null;
    readonly agentId?: string;
    readonly at?: string;
  }): ContextContribution | null;
}

export function createMockGoalAgentPort(
  contribution?: ContextContribution | null,
): GoalAgentPort {
  return {
    contribute(input) {
      if (contribution === null) return null;
      if (contribution) return freezeContribution(contribution);
      const at = input.at ?? "2026-07-25T12:00:00.000Z";
      return freezeContribution({
        id: `contribution:goal:${input.athleteId}`,
        sourceKind: ContextSourceKinds.GOAL,
        agentId: input.agentId ?? "agent:goal",
        athleteId: input.athleteId,
        sessionId: input.sessionId ?? null,
        conversationId: input.conversationId ?? null,
        slice: Object.freeze({
          id: `slice:goal:${input.athleteId}`,
          sourceKind: ContextSourceKinds.GOAL,
          referenceId: null,
          label: "goal agent",
          facts: Object.freeze({"primaryGoal":"Increase squat","goalId":"goal:1"} as Record<
            string,
            string | number | boolean | null
          >),
          notes: Object.freeze(["mock goal contribution"]),
          metadata: EMPTY_CONTEXT_METADATA,
          contributedAt: at,
        }),
        version: null,
        notes: Object.freeze(["mock goal agent port"]),
        metadata: EMPTY_CONTEXT_METADATA,
        contributedAt: at,
      });
    },
  };
}

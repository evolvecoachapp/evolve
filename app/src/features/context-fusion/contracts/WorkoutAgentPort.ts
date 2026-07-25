import type { ContextContribution } from "../models/ContextContribution";
import { EMPTY_CONTEXT_METADATA } from "../models/ContextMetadata";
import { ContextSourceKinds } from "../models/ContextSource";
import { freezeContribution } from "../utils/FreezeContext";

export interface WorkoutAgentPort {
  contribute(input: {
    readonly athleteId: string;
    readonly sessionId?: string | null;
    readonly conversationId?: string | null;
    readonly agentId?: string;
    readonly at?: string;
  }): ContextContribution | null;
}

export function createMockWorkoutAgentPort(
  contribution?: ContextContribution | null,
): WorkoutAgentPort {
  return {
    contribute(input) {
      if (contribution === null) return null;
      if (contribution) return freezeContribution(contribution);
      const at = input.at ?? "2026-07-25T12:00:00.000Z";
      return freezeContribution({
        id: `contribution:workout:${input.athleteId}`,
        sourceKind: ContextSourceKinds.WORKOUT,
        agentId: input.agentId ?? "agent:workout",
        athleteId: input.athleteId,
        sessionId: input.sessionId ?? null,
        conversationId: input.conversationId ?? null,
        slice: Object.freeze({
          id: `slice:workout:${input.athleteId}`,
          sourceKind: ContextSourceKinds.WORKOUT,
          referenceId: null,
          label: "workout agent",
          facts: Object.freeze({"focus":"strength","programId":"program:1","lastSessionId":"session:workout:1"} as Record<
            string,
            string | number | boolean | null
          >),
          notes: Object.freeze(["mock workout contribution"]),
          metadata: EMPTY_CONTEXT_METADATA,
          contributedAt: at,
        }),
        version: null,
        notes: Object.freeze(["mock workout agent port"]),
        metadata: EMPTY_CONTEXT_METADATA,
        contributedAt: at,
      });
    },
  };
}

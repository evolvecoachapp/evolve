import type { ContextContribution } from "../models/ContextContribution";
import { EMPTY_CONTEXT_METADATA } from "../models/ContextMetadata";
import { ContextSourceKinds } from "../models/ContextSource";
import { freezeContribution } from "../utils/FreezeContext";

export interface AthleteStatePort {
  contribute(input: {
    readonly athleteId: string;
    readonly sessionId?: string | null;
    readonly conversationId?: string | null;
    readonly agentId?: string;
    readonly at?: string;
  }): ContextContribution | null;
}

export function createMockAthleteStatePort(
  contribution?: ContextContribution | null,
): AthleteStatePort {
  return {
    contribute(input) {
      if (contribution === null) return null;
      if (contribution) return freezeContribution(contribution);
      const at = input.at ?? "2026-07-25T12:00:00.000Z";
      return freezeContribution({
        id: `contribution:athlete:${input.athleteId}`,
        sourceKind: ContextSourceKinds.ATHLETE,
        agentId: input.agentId ?? "engine:athlete-state",
        athleteId: input.athleteId,
        sessionId: input.sessionId ?? null,
        conversationId: input.conversationId ?? null,
        slice: Object.freeze({
          id: `slice:athlete:${input.athleteId}`,
          sourceKind: ContextSourceKinds.ATHLETE,
          referenceId: `state:${input.athleteId}`,
          label: "athlete state",
          facts: Object.freeze({
            stateId: `state:${input.athleteId}`,
            status: "active",
            readinessLabel: "ready",
          }),
          notes: Object.freeze(["mock athlete state contribution"]),
          metadata: EMPTY_CONTEXT_METADATA,
          contributedAt: at,
        }),
        version: Object.freeze({
          major: 1,
          minor: 0,
          patch: 0,
          revision: 1,
          label: "1.0.0+1",
        }),
        notes: Object.freeze(["mock athlete state port"]),
        metadata: EMPTY_CONTEXT_METADATA,
        contributedAt: at,
      });
    },
  };
}

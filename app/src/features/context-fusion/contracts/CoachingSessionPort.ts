import type { ContextContribution } from "../models/ContextContribution";
import { EMPTY_CONTEXT_METADATA } from "../models/ContextMetadata";
import { ContextSourceKinds } from "../models/ContextSource";
import { freezeContribution } from "../utils/FreezeContext";

export interface CoachingSessionPort {
  contribute(input: {
    readonly athleteId: string;
    readonly sessionId?: string | null;
    readonly conversationId?: string | null;
    readonly agentId?: string;
    readonly at?: string;
  }): ContextContribution | null;
}

export function createMockCoachingSessionPort(
  contribution?: ContextContribution | null,
): CoachingSessionPort {
  return {
    contribute(input) {
      if (contribution === null) return null;
      if (contribution) return freezeContribution(contribution);
      const at = input.at ?? "2026-07-25T12:00:00.000Z";
      const sessionId = input.sessionId ?? "session:coach:1";
      return freezeContribution({
        id: `contribution:session:${input.athleteId}`,
        sourceKind: ContextSourceKinds.SESSION,
        agentId: input.agentId ?? "runtime:coaching-session",
        athleteId: input.athleteId,
        sessionId,
        conversationId: input.conversationId ?? null,
        slice: Object.freeze({
          id: `slice:session:${input.athleteId}`,
          sourceKind: ContextSourceKinds.SESSION,
          referenceId: sessionId,
          label: "coaching session",
          facts: Object.freeze({
            status: "active",
            phase: "coaching",
            turnCount: 1,
          }),
          notes: Object.freeze(["mock session contribution"]),
          metadata: EMPTY_CONTEXT_METADATA,
          contributedAt: at,
        }),
        version: null,
        notes: Object.freeze(["mock coaching session port"]),
        metadata: EMPTY_CONTEXT_METADATA,
        contributedAt: at,
      });
    },
  };
}

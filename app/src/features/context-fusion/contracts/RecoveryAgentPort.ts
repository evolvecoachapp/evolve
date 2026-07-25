import type { ContextContribution } from "../models/ContextContribution";
import { EMPTY_CONTEXT_METADATA } from "../models/ContextMetadata";
import { ContextSourceKinds } from "../models/ContextSource";
import { freezeContribution } from "../utils/FreezeContext";

export interface RecoveryAgentPort {
  contribute(input: {
    readonly athleteId: string;
    readonly sessionId?: string | null;
    readonly conversationId?: string | null;
    readonly agentId?: string;
    readonly at?: string;
  }): ContextContribution | null;
}

export function createMockRecoveryAgentPort(
  contribution?: ContextContribution | null,
): RecoveryAgentPort {
  return {
    contribute(input) {
      if (contribution === null) return null;
      if (contribution) return freezeContribution(contribution);
      const at = input.at ?? "2026-07-25T12:00:00.000Z";
      return freezeContribution({
        id: `contribution:recovery:${input.athleteId}`,
        sourceKind: ContextSourceKinds.RECOVERY,
        agentId: input.agentId ?? "agent:recovery",
        athleteId: input.athleteId,
        sessionId: input.sessionId ?? null,
        conversationId: input.conversationId ?? null,
        slice: Object.freeze({
          id: `slice:recovery:${input.athleteId}`,
          sourceKind: ContextSourceKinds.RECOVERY,
          referenceId: null,
          label: "recovery agent",
          facts: Object.freeze({"status":"adequate","sleepHours":7.5} as Record<
            string,
            string | number | boolean | null
          >),
          notes: Object.freeze(["mock recovery contribution"]),
          metadata: EMPTY_CONTEXT_METADATA,
          contributedAt: at,
        }),
        version: null,
        notes: Object.freeze(["mock recovery agent port"]),
        metadata: EMPTY_CONTEXT_METADATA,
        contributedAt: at,
      });
    },
  };
}

import type { ContextContribution } from "../models/ContextContribution";
import { EMPTY_CONTEXT_METADATA } from "../models/ContextMetadata";
import { ContextSourceKinds } from "../models/ContextSource";
import { freezeContribution } from "../utils/FreezeContext";

export interface SupervisorPort {
  contribute(input: {
    readonly athleteId: string;
    readonly sessionId?: string | null;
    readonly conversationId?: string | null;
    readonly agentId?: string;
    readonly at?: string;
  }): ContextContribution | null;
}

export function createMockSupervisorPort(
  contribution?: ContextContribution | null,
): SupervisorPort {
  return {
    contribute(input) {
      if (contribution === null) return null;
      if (contribution) return freezeContribution(contribution);
      const at = input.at ?? "2026-07-25T12:00:00.000Z";
      return freezeContribution({
        id: `contribution:supervisor:${input.athleteId}`,
        sourceKind: ContextSourceKinds.SUPERVISOR,
        agentId: input.agentId ?? "agent:coach-supervisor",
        athleteId: input.athleteId,
        sessionId: input.sessionId ?? null,
        conversationId: input.conversationId ?? null,
        slice: Object.freeze({
          id: `slice:supervisor:${input.athleteId}`,
          sourceKind: ContextSourceKinds.SUPERVISOR,
          referenceId: "supervisor:context:1",
          label: "coach supervisor",
          facts: Object.freeze({
            focus: "training",
            routingPlanId: "routing:1",
            coordinationStatus: "ready",
          }),
          notes: Object.freeze(["mock supervisor contribution"]),
          metadata: EMPTY_CONTEXT_METADATA,
          contributedAt: at,
        }),
        version: null,
        notes: Object.freeze(["mock supervisor port"]),
        metadata: EMPTY_CONTEXT_METADATA,
        contributedAt: at,
      });
    },
  };
}

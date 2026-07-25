import type { ContextContribution } from "../models/ContextContribution";
import { EMPTY_CONTEXT_METADATA } from "../models/ContextMetadata";
import { ContextSourceKinds } from "../models/ContextSource";
import { freezeContribution } from "../utils/FreezeContext";

/**
 * Port for Conversation Runtime context into fusion.
 */
export interface ConversationRuntimePort {
  contribute(input: {
    readonly athleteId: string;
    readonly sessionId?: string | null;
    readonly conversationId?: string | null;
    readonly agentId?: string;
    readonly at?: string;
  }): ContextContribution | null;
}

export function createMockConversationRuntimePort(
  contribution?: ContextContribution | null,
): ConversationRuntimePort {
  return {
    contribute(input) {
      if (contribution === null) return null;
      if (contribution) return freezeContribution(contribution);
      const at = input.at ?? "2026-07-25T12:00:00.000Z";
      return freezeContribution({
        id: `contribution:conversation:${input.athleteId}`,
        sourceKind: ContextSourceKinds.CONVERSATION,
        agentId: input.agentId ?? "runtime:conversation",
        athleteId: input.athleteId,
        sessionId: input.sessionId ?? null,
        conversationId: input.conversationId ?? "conversation:1",
        slice: Object.freeze({
          id: `slice:conversation:${input.athleteId}`,
          sourceKind: ContextSourceKinds.CONVERSATION,
          referenceId: input.conversationId ?? "conversation:1",
          label: "conversation runtime",
          facts: Object.freeze({
            turnId: "turn:1",
            intent: "coaching",
            lastUserMessageId: "msg:user:1",
          }),
          notes: Object.freeze(["mock conversation contribution"]),
          metadata: EMPTY_CONTEXT_METADATA,
          contributedAt: at,
        }),
        version: null,
        notes: Object.freeze(["mock conversation port"]),
        metadata: EMPTY_CONTEXT_METADATA,
        contributedAt: at,
      });
    },
  };
}

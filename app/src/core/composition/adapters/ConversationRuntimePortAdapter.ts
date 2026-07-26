import type {
  ConversationRuntimeDescriptor,
  ConversationRuntimePort,
} from "../../../features/coaching-session/contracts/ConversationRuntimePort";

/**
 * Mutable conversation runtime port for coach composition binding.
 * Descriptor registry only — no chat / AI logic.
 */
export class BoundConversationRuntimePort implements ConversationRuntimePort {
  private readonly descriptors = new Map<
    string,
    ConversationRuntimeDescriptor
  >();

  constructor(private readonly athleteId: string | null = null) {}

  describe(conversationId: string): ConversationRuntimeDescriptor | null {
    return this.descriptors.get(conversationId) ?? null;
  }

  remember(conversationId: string, active = true): void {
    this.descriptors.set(
      conversationId,
      Object.freeze({
        conversationId,
        athleteId: this.athleteId,
        active,
      }),
    );
  }
}

export function createBoundConversationRuntimePort(
  athleteId: string | null = null,
): BoundConversationRuntimePort {
  return new BoundConversationRuntimePort(athleteId);
}

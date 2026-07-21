import type { ConversationService } from "../services/ConversationService";

/**
 * Application use-case: delete a conversation permanently.
 */
export async function deleteConversation(
  service: ConversationService,
  conversationId: string,
): Promise<void> {
  return service.deleteConversation(conversationId);
}

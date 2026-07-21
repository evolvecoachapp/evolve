import type { Conversation } from "../models/Conversation";
import type { ConversationService } from "../services/ConversationService";

/**
 * Application use-case: close an active conversation session.
 */
export async function closeConversation(
  service: ConversationService,
  conversationId: string,
): Promise<Conversation> {
  return service.closeConversation(conversationId);
}

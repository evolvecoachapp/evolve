import type { ConversationService } from "../services/ConversationService";
import type { Conversation } from "../models/Conversation";
import type { StartConversationOptions } from "../services/ConversationService";

/**
 * Application use-case: start a new coach conversation.
 */
export async function startConversation(
  service: ConversationService,
  options: StartConversationOptions = {},
): Promise<Conversation> {
  return service.startConversation(options);
}

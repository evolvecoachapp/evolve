import type { Conversation } from "../models/Conversation";
import type {
  ConversationService,
  SendMessageOptions,
} from "../services/ConversationService";

/**
 * Application use-case: send a user message and generate an assistant reply.
 */
export async function sendMessage(
  service: ConversationService,
  options: SendMessageOptions,
): Promise<Conversation> {
  return service.sendMessage(options);
}

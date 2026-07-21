import type { Conversation } from "../models/Conversation";
import type {
  ConversationService,
  RetryMessageOptions,
} from "../services/ConversationService";

/**
 * Application use-case: retry a failed user message.
 */
export async function retryMessage(
  service: ConversationService,
  options: RetryMessageOptions,
): Promise<Conversation> {
  return service.retryMessage(options);
}

import type { Conversation } from "../models/Conversation";
import type {
  ConversationService,
  SendCoachingReplyOptions,
} from "../services/ConversationService";

/**
 * Application use-case: persist a coaching turn with a prepared assistant reply.
 */
export async function sendCoachingReply(
  service: ConversationService,
  options: SendCoachingReplyOptions,
): Promise<Conversation> {
  return service.sendCoachingReply(options);
}

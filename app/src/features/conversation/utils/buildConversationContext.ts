import type { ConversationContext } from "../../ai/models/ConversationContext";
import type { ChatMessage } from "../../ai/models/ChatMessage";
import type { Conversation } from "../models/Conversation";
import type { ConversationMessage } from "../models/ConversationMessage";
import { sortMessages } from "./sortMessages";

/**
 * Build an AI-layer ConversationContext from domain conversation state.
 *
 * Only sent messages are included — pending/failed turns stay out of the
 * provider request. Maps MessageRole → ChatRole without prose or markdown.
 */
export function buildConversationContext(
  conversation: Conversation,
): ConversationContext {
  const messages = Object.freeze(
    sortMessages(conversation.messages)
      .filter((message) => message.status === "sent")
      .map(toChatMessage),
  );

  return Object.freeze({
    conversationId: conversation.id,
    messages,
  });
}

function toChatMessage(message: ConversationMessage): ChatMessage {
  return Object.freeze({
    id: message.id,
    role: message.role,
    content: message.content,
    createdAt: message.createdAt,
  });
}

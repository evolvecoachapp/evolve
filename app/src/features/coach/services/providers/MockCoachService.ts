import { initialCoachConversation } from "../../mocks/initialConversation";
import type { CoachConversation } from "../../types/coachConversation";
import type {
  CoachSendMessageRequest,
  CoachSendMessageResponse,
  CoachService,
  CoachStreamHandler,
} from "../../types/coachService";
import { InMemoryConversationMemory } from "../memory/InMemoryConversationMemory";
import { createCoachMessage, createConversationId } from "./messageFactory";
import { pickMockCoachResponse } from "./mockResponses";

const MOCK_STREAM_CHUNK_DELAY_MS = 35;

const memory = new InMemoryConversationMemory();

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/** Default provider — deterministic keyword rules with seeded conversation history. */
export const mockCoachService: CoachService = {
  providerId: "mock",

  async createConversation(): Promise<CoachConversation> {
    const id = createConversationId();
    const messages = [...initialCoachConversation];
    memory.initConversation(id, messages);

    return {
      id,
      createdAt: new Date().toISOString(),
      messages,
    };
  },

  async sendMessage(request: CoachSendMessageRequest): Promise<CoachSendMessageResponse> {
    const content = pickMockCoachResponse(request.message.trim());
    const message = createCoachMessage(content);
    memory.appendMessage(request.conversationId, message);

    return {
      conversationId: request.conversationId,
      message,
    };
  },

  async sendMessageStream(
    request: CoachSendMessageRequest,
    onChunk: CoachStreamHandler,
  ): Promise<CoachSendMessageResponse> {
    const content = pickMockCoachResponse(request.message.trim());
    const message = createCoachMessage(content);
    const words = content.split(/(\s+)/);

    for (let index = 0; index < words.length; index += 1) {
      const delta = words[index];
      const done = index === words.length - 1;
      onChunk({
        conversationId: request.conversationId,
        messageId: message.id,
        delta,
        done,
      });

      if (!done) {
        await delay(MOCK_STREAM_CHUNK_DELAY_MS);
      }
    }

    memory.appendMessage(request.conversationId, message);

    return {
      conversationId: request.conversationId,
      message,
    };
  },
};

export function getMockConversationHistory(conversationId: string) {
  return memory.getHistory(conversationId);
}

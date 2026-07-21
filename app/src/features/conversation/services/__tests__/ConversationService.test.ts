import { AIError } from "../../../ai/models/AIError";
import type { AIProvider } from "../../../ai/providers/AIProvider";
import { AIService } from "../../../ai/services/AIService";
import { createAIResponse } from "../../../ai/testSupport/fixtures";
import { ConversationError } from "../../models/ConversationError";
import { InMemoryConversationRepository } from "../../repository/InMemoryConversationRepository";
import {
  createPromptContext,
  FIXED_TIMESTAMP,
} from "../../testSupport/fixtures";
import { ConversationService } from "../ConversationService";

function createProvider(
  generate: AIProvider["generateResponse"] = async () =>
    createAIResponse({
      message: {
        id: "msg-assistant-1",
        role: "assistant",
        content: "Keep your plan and prioritize recovery.",
        createdAt: FIXED_TIMESTAMP,
      },
      generatedAt: FIXED_TIMESTAMP,
    }),
): AIProvider {
  return {
    generateResponse: generate,
    async healthCheck() {
      return true;
    },
    getProviderInfo() {
      return {
        type: "openai",
        name: "OpenAI Stub",
        model: {
          id: "gpt-stub-4o",
          name: "GPT Stub 4o",
          provider: "openai",
        },
      };
    },
  };
}

describe("ConversationService", () => {
  it("injects repository and AIService via constructor", () => {
    const first = new ConversationService(
      new InMemoryConversationRepository(),
      new AIService(createProvider()),
    );
    const second = new ConversationService(
      new InMemoryConversationRepository(),
      new AIService(createProvider()),
    );

    expect(first).not.toBe(second);
  });

  it("starts an empty active conversation", async () => {
    const service = new ConversationService(
      new InMemoryConversationRepository(),
      new AIService(createProvider()),
    );

    const conversation = await service.startConversation({
      now: FIXED_TIMESTAMP,
    });

    expect(conversation.status).toBe("active");
    expect(conversation.messages).toHaveLength(0);
    expect(conversation.metadata.title).toBe("New conversation");
    expect(conversation.session.endedAt).toBeNull();
  });

  it("sends a user message, calls AIService, and appends assistant reply", async () => {
    let capturedConversationId: string | undefined;
    const provider = createProvider(async (request) => {
      capturedConversationId = request.conversation?.conversationId;
      return createAIResponse({
        message: {
          id: "msg-assistant-1",
          role: "assistant",
          content: "Train upper body today.",
          createdAt: FIXED_TIMESTAMP,
        },
      });
    });

    const service = new ConversationService(
      new InMemoryConversationRepository(),
      new AIService(provider),
    );
    const started = await service.startConversation({ now: FIXED_TIMESTAMP });

    const next = await service.sendMessage({
      conversationId: started.id,
      content: "What should I train?",
      promptContext: createPromptContext(),
      now: FIXED_TIMESTAMP,
    });

    expect(capturedConversationId).toBe(started.id);
    expect(next.messages).toHaveLength(2);
    expect(next.messages[0]?.role).toBe("user");
    expect(next.messages[0]?.status).toBe("sent");
    expect(next.messages[1]?.role).toBe("assistant");
    expect(next.messages[1]?.content).toBe("Train upper body today.");
    expect(next.metadata.title).toBe("What should I train?");
  });

  it("marks the user message failed and throws ConversationError on provider failure", async () => {
    const provider = createProvider(async () => {
      throw new AIError("provider_unavailable", "stub offline", "openai");
    });
    const repository = new InMemoryConversationRepository();
    const service = new ConversationService(
      repository,
      new AIService(provider),
    );
    const started = await service.startConversation({ now: FIXED_TIMESTAMP });

    await expect(
      service.sendMessage({
        conversationId: started.id,
        content: "Help me",
        promptContext: createPromptContext(),
        now: FIXED_TIMESTAMP,
      }),
    ).rejects.toMatchObject({ code: "provider_failed" });

    const stored = await repository.getById(started.id);
    expect(stored?.status).toBe("error");
    expect(stored?.messages[0]?.status).toBe("failed");
    expect(stored?.messages[0]?.errorCode).toBe("provider_unavailable");
  });

  it("retries a failed user message", async () => {
    let calls = 0;
    const provider = createProvider(async () => {
      calls += 1;
      if (calls === 1) {
        throw new AIError("generation_failed", "temporary", "openai");
      }
      return createAIResponse({
        message: {
          id: "msg-assistant-retry",
          role: "assistant",
          content: "Retry succeeded.",
          createdAt: FIXED_TIMESTAMP,
        },
      });
    });

    const service = new ConversationService(
      new InMemoryConversationRepository(),
      new AIService(provider),
    );
    const started = await service.startConversation({ now: FIXED_TIMESTAMP });

    await expect(
      service.sendMessage({
        conversationId: started.id,
        content: "Retry me",
        promptContext: createPromptContext(),
        now: FIXED_TIMESTAMP,
      }),
    ).rejects.toBeInstanceOf(ConversationError);

    const failed = await service.getConversation(started.id);
    const failedMessageId = failed.messages[0]!.id;

    const recovered = await service.retryMessage({
      conversationId: started.id,
      messageId: failedMessageId,
      promptContext: createPromptContext(),
      now: FIXED_TIMESTAMP,
    });

    expect(recovered.status).toBe("active");
    expect(recovered.messages).toHaveLength(2);
    expect(recovered.messages[1]?.content).toBe("Retry succeeded.");
  });

  it("rejects send on closed conversations", async () => {
    const service = new ConversationService(
      new InMemoryConversationRepository(),
      new AIService(createProvider()),
    );
    const started = await service.startConversation({ now: FIXED_TIMESTAMP });
    await service.closeConversation(started.id);

    await expect(
      service.sendMessage({
        conversationId: started.id,
        content: "Nope",
        promptContext: createPromptContext(),
      }),
    ).rejects.toMatchObject({ code: "conversation_closed" });
  });

  it("closes and deletes conversations", async () => {
    const repository = new InMemoryConversationRepository();
    const service = new ConversationService(
      repository,
      new AIService(createProvider()),
    );
    const started = await service.startConversation({ now: FIXED_TIMESTAMP });

    const closed = await service.closeConversation(started.id);
    expect(closed.status).toBe("closed");

    await service.deleteConversation(started.id);
    await expect(repository.getById(started.id)).resolves.toBeNull();
  });
});

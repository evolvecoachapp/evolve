import { act, renderHook, waitFor } from "@testing-library/react-native";
import { AIConfigurationFactory } from "../../../ai-config/factory";
import type { AIRequest } from "../../../ai/models/AIRequest";
import type { AIResponse } from "../../../ai/models/AIResponse";
import type { AIProvider } from "../../../ai/providers/AIProvider";
import { createStubStream } from "../../../ai/providers/stubHelpers";
import { AIService } from "../../../ai/services/AIService";
import { createAIResponse } from "../../../ai/testSupport/fixtures";
import { InMemoryConversationRepository } from "../../repository/InMemoryConversationRepository";
import { ConversationService } from "../../services/ConversationService";
import {
  createPromptContext,
  FIXED_TIMESTAMP,
} from "../../testSupport/fixtures";
import { useCoachConversation } from "../useCoachConversation";

function createService(): ConversationService {
  const generate = async (): Promise<AIResponse> =>
    createAIResponse({
      message: {
        id: "msg-assistant-hook",
        role: "assistant",
        content: "Hook assistant reply.",
        createdAt: FIXED_TIMESTAMP,
      },
      generatedAt: FIXED_TIMESTAMP,
      provider: "local",
      model: {
        id: "local-stub",
        name: "Local Stub",
        provider: "local",
      },
    });

  const provider: AIProvider = {
    generateResponse: generate,
    async *streamResponse(request: AIRequest, options) {
      const response = await generate();
      yield* createStubStream(
        {
          type: "local",
          name: "Local Stub",
          model: response.model,
          sampleContent: response.message.content,
        },
        {
          ...request,
          promptGeneratedAt: response.generatedAt,
        },
        options,
      );
    },
    async healthCheck() {
      return true;
    },
    getProviderInfo() {
      return {
        type: "local",
        name: "Local Stub",
        model: {
          id: "local-stub",
          name: "Local Stub",
          provider: "local",
        },
      };
    },
  };

  return new ConversationService(
    new InMemoryConversationRepository(),
    new AIService(provider, AIConfigurationFactory.createDefault()),
  );
}

describe("useCoachConversation", () => {
  it("starts a conversation through the injected service", async () => {
    const service = createService();
    const { result } = renderHook(() =>
      useCoachConversation({
        service,
        promptContext: createPromptContext(),
      }),
    );

    await act(async () => {
      await result.current.startConversation();
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeNull();
    expect(result.current.conversation?.status).toBe("active");
    expect(result.current.messages).toHaveLength(0);
    expect(result.current.status).toBe("active");
    expect(result.current.isStreaming).toBe(false);
    expect(result.current.currentStream).toBeNull();
  });

  it("sends a message and exposes assistant reply", async () => {
    const service = createService();
    const { result } = renderHook(() =>
      useCoachConversation({
        service,
        promptContext: createPromptContext(),
      }),
    );

    await act(async () => {
      await result.current.startConversation();
    });

    await act(async () => {
      await result.current.sendMessage("How should I train?");
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeNull();
    expect(result.current.isStreaming).toBe(false);
    expect(result.current.messages).toHaveLength(2);
    expect(result.current.messages[1]?.content).toBe("Hook assistant reply.");
  });

  it("exposes cancelStream", async () => {
    const service = createService();
    const { result } = renderHook(() =>
      useCoachConversation({
        service,
        promptContext: createPromptContext(),
      }),
    );

    await act(async () => {
      await result.current.startConversation();
    });

    await act(async () => {
      await result.current.cancelStream();
    });

    expect(result.current.isStreaming).toBe(false);
    expect(typeof result.current.cancelStream).toBe("function");
  });

  it("requires prompt context for sendMessage", async () => {
    const service = createService();
    const { result } = renderHook(() => useCoachConversation({ service }));

    await act(async () => {
      await result.current.startConversation();
    });

    await act(async () => {
      await result.current.sendMessage("Hello");
    });

    expect(result.current.error).toBe(
      "Prompt context is required to send a message.",
    );
  });

  it("closes and deletes the active conversation", async () => {
    const service = createService();
    const { result } = renderHook(() =>
      useCoachConversation({
        service,
        promptContext: createPromptContext(),
      }),
    );

    await act(async () => {
      await result.current.startConversation();
    });

    await act(async () => {
      await result.current.closeConversation();
    });

    expect(result.current.status).toBe("closed");

    await act(async () => {
      await result.current.deleteConversation();
    });

    expect(result.current.conversation).toBeNull();
    expect(result.current.messages).toHaveLength(0);
  });
});

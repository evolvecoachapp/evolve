import { AIConfigurationFactory } from "../../../ai-config/factory";
import { isToolRequest } from "../../../tool-calling/utils/isToolRequest";
import { AIError } from "../../models/AIError";
import { AIProviderFactory } from "../../providers/AIProviderFactory";
import { OpenAIProviderStub } from "../../providers/OpenAIProviderStub";
import { AIService } from "../AIService";
import {
  createConversation,
  createPromptContext,
  FIXED_TIMESTAMP,
} from "../../testSupport/fixtures";
import type { AIProvider } from "../../providers/AIProvider";
import type { AIRequest } from "../../models/AIRequest";
import type { AIResponse } from "../../models/AIResponse";
import { createAIResponse } from "../../testSupport/fixtures";

const testConfiguration = AIConfigurationFactory.createDefault();

describe("AIService", () => {
  it("injects provider and configuration via constructor and returns AIResponse", async () => {
    const provider = new OpenAIProviderStub();
    const service = new AIService(provider, testConfiguration);
    const promptContext = createPromptContext();

    const response = await service.generateResponse(promptContext);

    expect(isToolRequest(response)).toBe(false);
    if (isToolRequest(response)) {
      return;
    }
    expect(response.provider).toBe("openai");
    expect(response.message.role).toBe("assistant");
    expect(response.generatedAt).toBe(FIXED_TIMESTAMP);
    expect(await service.healthCheck()).toBe(true);
    expect(service.getConfiguration()).toBe(testConfiguration);
  });

  it("forwards conversation messages into the provider request", async () => {
    let captured: AIRequest | undefined;

    const provider: AIProvider = {
      async generateResponse(request) {
        captured = request;
        return createAIResponse({
          generatedAt: request.promptGeneratedAt,
          message: {
            id: "msg-stub-openai",
            role: "assistant",
            content: "ok",
            createdAt: request.promptGeneratedAt,
          },
        });
      },
      async *streamResponse() {
        // unused in this test
      },
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

    const service = new AIService(provider, testConfiguration);
    const conversation = createConversation();
    await service.generateResponse(createPromptContext(), conversation);

    expect(captured?.conversation?.conversationId).toBe("conv-test-1");
    expect(captured?.messages.some((m) => m.role === "user")).toBe(true);
    expect(captured?.messages[0]?.role).toBe("system");
    expect(captured?.sectionIds.length).toBeGreaterThan(0);
  });

  it("works with every factory stub provider", async () => {
    const promptContext = createPromptContext();

    for (const type of ["openai", "anthropic", "gemini", "local"] as const) {
      const service = new AIService(
        AIProviderFactory.create(type),
        testConfiguration,
      );
      const response = await service.generateResponse(promptContext);
      expect(isToolRequest(response)).toBe(false);
      if (isToolRequest(response)) {
        return;
      }
      expect(response.provider).toBe(type);
    }
  });

  it("passes through ToolRequest without executing tools", async () => {
    const toolRequest = Object.freeze({
      id: "tool-req-1",
      toolName: "get_athlete_profile",
      arguments: Object.freeze([]),
      requestedAt: FIXED_TIMESTAMP,
    });

    const provider: AIProvider = {
      async generateResponse() {
        return toolRequest;
      },
      async *streamResponse() {
        // unused
      },
      async healthCheck() {
        return true;
      },
      getProviderInfo() {
        return {
          type: "local",
          name: "Local Stub",
          model: {
            id: "local-stub-v1",
            name: "Local Stub v1",
            provider: "local",
          },
        };
      },
    };

    const service = new AIService(provider, testConfiguration);
    const result = await service.generateResponse(createPromptContext());

    expect(isToolRequest(result)).toBe(true);
    if (!isToolRequest(result)) {
      return;
    }
    expect(result.toolName).toBe("get_athlete_profile");
  });

  it("throws AIError for invalid prompt context conversion", async () => {
    const service = new AIService(new OpenAIProviderStub(), testConfiguration);
    const promptContext = createPromptContext();
    const invalid = {
      ...promptContext,
      athlete: {
        ...promptContext.athlete,
        consistencyScore: 2,
      },
    };

    await expect(service.generateResponse(invalid)).rejects.toBeInstanceOf(
      AIError,
    );
  });

  it("throws AIError when provider returns an invalid response", async () => {
    const provider: AIProvider = {
      async generateResponse(): Promise<AIResponse> {
        return createAIResponse({
          usage: {
            promptTokens: 10,
            completionTokens: 5,
            totalTokens: 99,
          },
        });
      },
      async *streamResponse() {
        // unused in this test
      },
      async healthCheck() {
        return true;
      },
      getProviderInfo() {
        return {
          type: "openai",
          name: "Broken Stub",
          model: {
            id: "broken",
            name: "Broken",
            provider: "openai",
          },
        };
      },
    };

    const service = new AIService(provider, testConfiguration);

    await expect(
      service.generateResponse(createPromptContext()),
    ).rejects.toMatchObject({
      code: "invalid_response",
    });
  });

  it("does not expose a singleton — each construction is independent", () => {
    const first = new AIService(new OpenAIProviderStub(), testConfiguration);
    const second = new AIService(new OpenAIProviderStub(), testConfiguration);
    expect(first).not.toBe(second);
  });

  it("does not instantiate configuration internally", () => {
    const configuration = AIConfigurationFactory.createDefault({
      providerType: "anthropic",
      apiKey: "test-key",
    });
    const service = new AIService(new OpenAIProviderStub(), configuration);
    expect(service.getConfiguration()).toBe(configuration);
    expect(service.getConfiguration().provider.type).toBe("anthropic");
  });
});

import { AIConfigurationFactory } from "../../../ai-config/factory";
import { isToolRequest } from "../../../tool-calling/utils/isToolRequest";
import { createToolRequest } from "../../../tool-calling/testSupport/fixtures";
import { isWorkflowRequest } from "../../../workflow/utils/isWorkflowRequest";
import { AIError } from "../../models/AIError";
import type { AIStreamEvent } from "../../models/AIStreamEvent";
import type { AIProvider } from "../../providers/AIProvider";
import { LocalProviderStub } from "../../providers/LocalProviderStub";
import { OpenAIProviderStub } from "../../providers/OpenAIProviderStub";
import {
  createAIResponse,
  createPromptContext,
  FIXED_TIMESTAMP,
} from "../../testSupport/fixtures";
import { AIService } from "../AIService";

const testConfiguration = AIConfigurationFactory.createDefault();

describe("AIService.streamResponse", () => {
  it("streams stub chunks and returns a completed AIResponse", async () => {
    const service = new AIService(
      new OpenAIProviderStub(),
      testConfiguration,
    );
    const events: AIStreamEvent[] = [];

    const response = await service.streamResponse(createPromptContext(), undefined, {
      onEvent: (event) => {
        events.push(event);
      },
    });

    expect(events.some((event) => event.type === "start")).toBe(true);
    expect(events.some((event) => event.type === "chunk")).toBe(true);
    expect(events.some((event) => event.type === "done")).toBe(true);
    expect(isToolRequest(response)).toBe(false);
    expect(isWorkflowRequest(response)).toBe(false);
    if (isToolRequest(response) || isWorkflowRequest(response)) {
      return;
    }
    expect(response.message.role).toBe("assistant");
    expect(response.message.content.length).toBeGreaterThan(0);
    expect(response.provider).toBe("openai");
    expect(response.generatedAt).toBe(FIXED_TIMESTAMP);
  });

  it("works with the local stub provider", async () => {
    const service = new AIService(new LocalProviderStub(), testConfiguration);
    const response = await service.streamResponse(createPromptContext());
    expect(isToolRequest(response)).toBe(false);
    expect(isWorkflowRequest(response)).toBe(false);
    if (isToolRequest(response) || isWorkflowRequest(response)) {
      return;
    }
    expect(response.provider).toBe("local");
    expect(response.message.content).toContain("[Local Stub]");
  });

  it("returns ToolRequest when provider emits tool_request", async () => {
    const toolRequest = createToolRequest();
    const provider: AIProvider = {
      async generateResponse() {
        return toolRequest;
      },
      async *streamResponse() {
        yield {
          type: "start",
          sessionId: "s1",
          messageId: "m1",
          createdAt: FIXED_TIMESTAMP,
        };
        yield {
          type: "tool_request",
          sessionId: "s1",
          request: toolRequest,
        };
        yield {
          type: "done",
          sessionId: "s1",
          finishReason: "stop",
          usage: Object.freeze({
            promptTokens: 0,
            completionTokens: 0,
            totalTokens: 0,
          }),
          createdAt: FIXED_TIMESTAMP,
        };
      },
      async healthCheck() {
        return true;
      },
      getProviderInfo() {
        return {
          type: "local",
          name: "Tool Stub",
          model: {
            id: "local-stub-v1",
            name: "Local Stub v1",
            provider: "local",
          },
        };
      },
    };

    const service = new AIService(provider, testConfiguration);
    const result = await service.streamResponse(createPromptContext());

    expect(isToolRequest(result)).toBe(true);
    if (!isToolRequest(result)) {
      return;
    }
    expect(result.toolName).toBe("get_athlete_profile");
  });

  it("throws stream_cancelled when aborted", async () => {
    const controller = new AbortController();
    const provider: AIProvider = {
      async generateResponse() {
        return createAIResponse();
      },
      async *streamResponse(_request, options) {
        yield {
          type: "start",
          sessionId: "s1",
          messageId: "m1",
          createdAt: FIXED_TIMESTAMP,
        };
        options?.signal?.addEventListener("abort", () => undefined);
        controller.abort();
        yield {
          type: "status",
          sessionId: "s1",
          status: "cancelled",
        };
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

    await expect(
      service.streamResponse(createPromptContext(), undefined, {
        signal: controller.signal,
      }),
    ).rejects.toMatchObject({
      code: "stream_cancelled",
    });
  });

  it("throws AIError when stream ends without done", async () => {
    const provider: AIProvider = {
      async generateResponse() {
        return createAIResponse();
      },
      async *streamResponse() {
        yield {
          type: "start",
          sessionId: "s1",
          messageId: "m1",
          createdAt: FIXED_TIMESTAMP,
        };
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

    await expect(
      service.streamResponse(createPromptContext()),
    ).rejects.toBeInstanceOf(AIError);
  });
});

import { AIConfigurationFactory } from "../../../ai-config/factory";
import type { AIProvider } from "../../providers/AIProvider";
import { AIProviderFactory } from "../../providers/AIProviderFactory";
import { AIService } from "../../services/AIService";
import { createPromptContext } from "../../testSupport/fixtures";
import { createToolRequest } from "../../../tool-calling/testSupport/fixtures";
import { isToolRequest } from "../../../tool-calling/utils/isToolRequest";
import { FIXED_TIMESTAMP } from "../../../tool-calling/testSupport/fixtures";

describe("AIProvider tool integration", () => {
  it("stub providers continue returning AIResponse only", async () => {
    for (const type of ["openai", "anthropic", "gemini", "local"] as const) {
      const provider = AIProviderFactory.create(type);
      const result = await provider.generateResponse(
        Object.freeze({
          messages: Object.freeze([
            Object.freeze({
              id: "msg-1",
              role: "user" as const,
              content: "hello",
              createdAt: FIXED_TIMESTAMP,
            }),
          ]),
          schemaVersion: 1,
          sectionIds: Object.freeze([]),
          consistencyScore: 0,
          insightCount: 0,
          riskCount: 0,
          recommendationCount: 0,
          promptGeneratedAt: FIXED_TIMESTAMP,
        }),
      );

      expect(isToolRequest(result)).toBe(false);
    }
  });

  it("custom provider may return ToolRequest through AIService", async () => {
    const toolRequest = createToolRequest({
      toolName: "get_workout_summary",
    });
    const provider: AIProvider = {
      async generateResponse() {
        return toolRequest;
      },
      async *streamResponse() {
        yield {
          type: "tool_request",
          sessionId: "s1",
          request: toolRequest,
        };
      },
      async healthCheck() {
        return true;
      },
      getProviderInfo() {
        return {
          type: "local",
          name: "Tool Provider",
          model: {
            id: "local-stub-v1",
            name: "Local Stub v1",
            provider: "local",
          },
        };
      },
    };

    const service = new AIService(
      provider,
      AIConfigurationFactory.createDefault({ providerType: "local" }),
    );

    const generated = await service.generateResponse(createPromptContext());
    expect(isToolRequest(generated)).toBe(true);
    if (!isToolRequest(generated)) {
      return;
    }
    expect(generated.toolName).toBe("get_workout_summary");

    const streamed = await service.streamResponse(createPromptContext());
    expect(isToolRequest(streamed)).toBe(true);
  });
});

import { AI_PROVIDER_TYPES } from "../../models/AIProviderType";
import { AIProviderFactory } from "../AIProviderFactory";
import { AnthropicProviderStub } from "../AnthropicProviderStub";
import { GeminiProviderStub } from "../GeminiProviderStub";
import { LocalProviderStub } from "../LocalProviderStub";
import { OpenAIProviderStub } from "../OpenAIProviderStub";
import { createAIRequest } from "../../testSupport/fixtures";
import { AIError } from "../../models/AIError";

describe("AIProvider stubs", () => {
  const request = createAIRequest();

  it.each([
    ["openai", OpenAIProviderStub, "OpenAI Stub", "gpt-stub-4o"],
    ["anthropic", AnthropicProviderStub, "Anthropic Stub", "claude-stub-sonnet"],
    ["gemini", GeminiProviderStub, "Gemini Stub", "gemini-stub-pro"],
    ["local", LocalProviderStub, "Local Stub", "local-stub-v1"],
  ] as const)(
    "%s stub returns deterministic identity and usage",
    async (type, Stub, name, modelId) => {
      const provider = new Stub();
      const info = provider.getProviderInfo();
      const healthy = await provider.healthCheck();
      const response = await provider.generateResponse(request);

      expect(healthy).toBe(true);
      expect(info.type).toBe(type);
      expect(info.name).toBe(name);
      expect(info.model.id).toBe(modelId);
      expect(info.model.provider).toBe(type);

      expect(response.provider).toBe(type);
      expect(response.model.id).toBe(modelId);
      expect(response.message.role).toBe("assistant");
      expect(response.message.content).toContain(name);
      expect(response.generatedAt).toBe(request.promptGeneratedAt);
      expect(response.usage.totalTokens).toBe(
        response.usage.promptTokens + response.usage.completionTokens,
      );
    },
  );

  it("stubs are deterministic across repeated calls", async () => {
    const provider = new OpenAIProviderStub();
    const first = await provider.generateResponse(request);
    const second = await provider.generateResponse(request);

    expect(first).toEqual(second);
  });
});

describe("AIProviderFactory", () => {
  it.each(AI_PROVIDER_TYPES)("creates stub for %s", (type) => {
    const provider = AIProviderFactory.create(type);
    expect(provider.getProviderInfo().type).toBe(type);
  });

  it("createFromString rejects unknown providers", () => {
    expect(() => AIProviderFactory.createFromString("unknown")).toThrow(
      AIError,
    );

    try {
      AIProviderFactory.createFromString("unknown");
    } catch (error) {
      expect(error).toBeInstanceOf(AIError);
      expect((error as AIError).code).toBe("unsupported_provider");
    }
  });

  it("returns distinct stub instances", () => {
    const first = AIProviderFactory.create("openai");
    const second = AIProviderFactory.create("openai");
    expect(first).not.toBe(second);
  });
});

import { AIProviderIds } from "../../ai-provider/models/AIProviderId";
import { PromptBlockTypes } from "../../prompt-composition/models/PromptBlockType";
import { OpenAIRequestBuilder } from "../builders/OpenAIRequestBuilder";
import { OpenAIErrorMapper } from "../mappers/OpenAIErrorMapper";
import { OpenAIResponseMapper } from "../mappers/OpenAIResponseMapper";
import { OpenAIUsageMapper } from "../mappers/OpenAIUsageMapper";
import { PromptPackageMapper } from "../mappers/PromptPackageMapper";
import { RateLimitError } from "../errors";
import {
  createOpenAIResponseFixture,
  createPromptPackageFixture,
  createProviderConfiguration,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";

describe("openai-provider mappers", () => {
  it("PromptPackageMapper maps system blocks and user input", () => {
    const promptPackage = createPromptPackageFixture();
    const request = PromptPackageMapper.map(promptPackage, {
      configuration: createProviderConfiguration(),
      modelId: "gpt-4o",
    });

    expect(Object.isFrozen(request)).toBe(true);
    expect(request.model).toBe("gpt-4o");
    expect(request.stream).toBe(false);
    expect(request.messages[0]?.role).toBe("system");
    expect(request.messages[0]?.content).toContain("System");
    expect(request.messages[0]?.content).toContain("Safety");
    expect(request.messages.some((m) => m.role === "user")).toBe(true);
    expect(
      request.messages.find((m) => m.role === "user")?.content,
    ).toContain("Fixture");
  });

  it("OpenAIRequestBuilder.fromPromptPackage transforms PromptPackage", () => {
    const promptPackage = createPromptPackageFixture();
    const request = OpenAIRequestBuilder.fromPromptPackage(promptPackage, {
      configuration: createProviderConfiguration(),
      modelId: "gpt-4o-mini",
    });

    expect(request.model).toBe("gpt-4o-mini");
    expect(request.messages.some((m) => m.role === "user")).toBe(true);
  });

  it("PromptPackageMapper does not emit assistant history turns", () => {
    const promptPackage = createPromptPackageFixture();
    const request = PromptPackageMapper.map(promptPackage, {
      configuration: createProviderConfiguration(),
    });

    expect(request.messages.every((m) => m.role !== "assistant")).toBe(true);
    expect(
      promptPackage.blocks.some((b) => b.type === PromptBlockTypes.CONVERSATION),
    ).toBe(true);
    expect(request.messages[0]?.content).toContain("Conversation");
  });

  it("OpenAIResponseMapper maps OpenAIResponse to AIResponse", () => {
    const openAIResponse = createOpenAIResponseFixture({
      content: "Coach reply",
    });
    const response = OpenAIResponseMapper.map(openAIResponse, {
      requestId: "req-1",
      createdAt: FIXED_TIMESTAMP,
    });

    expect(Object.isFrozen(response)).toBe(true);
    expect(response.providerId).toBe(AIProviderIds.OPENAI);
    expect(response.content).toBe("Coach reply");
    expect(response.finishReason).toBe("stop");
    expect(response.usage.totalTokens).toBe(20);
    expect(response.requestId).toBe("req-1");
  });

  it("OpenAIUsageMapper maps usage to AIUsage", () => {
    const usage = OpenAIUsageMapper.toAIUsage(
      { promptTokens: 3, completionTokens: 5, totalTokens: 8 },
      { estimatedCost: 0.01, currency: "USD" },
    );
    expect(usage.totalTokens).toBe(8);
    expect(usage.estimatedCost).toBe(0.01);
    expect(usage.currency).toBe("USD");
  });

  it("OpenAIErrorMapper maps rate limits to hierarchy and AIError", () => {
    const typed = OpenAIErrorMapper.toTypedError({
      status: 429,
      message: "rate limited",
      code: "rate_limit_error",
    });
    expect(typed).toBeInstanceOf(RateLimitError);

    const aiError = OpenAIErrorMapper.toAIError(typed);
    expect(aiError.code).toBe("rate_limit_error");
    expect(aiError.providerId).toBe(AIProviderIds.OPENAI);
    expect(aiError.retryable).toBe(true);

    const mapped = OpenAIErrorMapper.toProviderError(typed);
    expect(mapped.code).toBe("rate_limit_error");
    expect(mapped.providerId).toBe(AIProviderIds.OPENAI);
  });
});

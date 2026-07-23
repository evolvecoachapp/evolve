import { AIProviderIds } from "../../ai-provider/models/AIProviderId";
import { PromptBlockTypes } from "../../prompt-composition/models/PromptBlockType";
import { ErrorMapper } from "../mappers/ErrorMapper";
import { PromptPackageMapper } from "../mappers/PromptPackageMapper";
import { ResponseMapper } from "../mappers/ResponseMapper";
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

  it("ResponseMapper maps OpenAIResponse to AIResponse", () => {
    const openAIResponse = createOpenAIResponseFixture({
      content: "Coach reply",
    });
    const response = ResponseMapper.map(openAIResponse, {
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

  it("ErrorMapper maps unknown errors to AIProviderError", () => {
    const mapped = ErrorMapper.toProviderError({
      status: 429,
      message: "rate limited",
      code: "rate_limit_error",
    });

    expect(mapped.code).toBe("rate_limit_error");
    expect(mapped.providerId).toBe(AIProviderIds.OPENAI);
    expect(mapped.message).toContain("rate limited");
  });
});

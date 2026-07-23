import {
  execute,
  executePrompt,
  executeStreaming,
  healthCheck,
  checkHealth,
  listAvailableModels,
  validateConfiguration,
} from "../application";
import { createOpenAIProviderService } from "../services";
import {
  createMockTransport,
  createOpenAIResponseFixture,
  createPromptPackageFixture,
  createProviderConfiguration,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";

describe("openai-provider application", () => {
  it("execute returns standardized AIResponse", async () => {
    const service = createOpenAIProviderService({
      configuration: createProviderConfiguration(),
      client: createMockTransport(
        createOpenAIResponseFixture({ content: "app reply" }),
      ),
    });

    const response = await execute({
      promptPackage: createPromptPackageFixture(),
      service,
      requestId: "app-1",
      executedAt: FIXED_TIMESTAMP,
    });

    expect(response.content).toBe("app reply");
    expect(response.requestId).toBe("app-1");
  });

  it("executePrompt remains an alias of execute", async () => {
    const service = createOpenAIProviderService({
      configuration: createProviderConfiguration(),
      client: createMockTransport(
        createOpenAIResponseFixture({ content: "alias reply" }),
      ),
    });

    const viaExecute = await execute({
      promptPackage: createPromptPackageFixture(),
      service,
      requestId: "alias-1",
      executedAt: FIXED_TIMESTAMP,
    });
    const viaAlias = await executePrompt({
      promptPackage: createPromptPackageFixture(),
      service,
      requestId: "alias-1",
      executedAt: FIXED_TIMESTAMP,
    });

    expect(viaAlias.content).toBe(viaExecute.content);
  });

  it("healthCheck returns health snapshot", async () => {
    const service = createOpenAIProviderService({
      configuration: createProviderConfiguration(),
      client: createMockTransport(),
    });

    const health = await healthCheck({ service });
    expect(health.healthy).toBe(true);
    const viaAlias = await checkHealth({ service });
    expect(viaAlias.healthy).toBe(true);
    expect(viaAlias.providerId).toBe(health.providerId);
  });

  it("validateConfiguration returns empty when valid", () => {
    const service = createOpenAIProviderService({
      configuration: createProviderConfiguration(),
      client: createMockTransport(),
    });

    expect(validateConfiguration({ service })).toEqual([]);
  });

  it("executeStreaming yields incremental chunks when enabled", async () => {
    const service = createOpenAIProviderService({
      configuration: createProviderConfiguration({ streaming: true }),
      client: createMockTransport(
        createOpenAIResponseFixture({ content: "Hello" }),
        undefined,
        Object.freeze([
          Object.freeze({
            id: "s1",
            index: 0,
            delta: "Hel",
            finishReason: null,
            model: "gpt-4o-mini",
            usage: null,
            createdAt: FIXED_TIMESTAMP,
          }),
          Object.freeze({
            id: "s1",
            index: 1,
            delta: "lo",
            finishReason: "stop",
            model: "gpt-4o-mini",
            usage: Object.freeze({
              promptTokens: 1,
              completionTokens: 1,
              totalTokens: 2,
            }),
            createdAt: FIXED_TIMESTAMP,
          }),
        ]),
      ),
    });

    const chunks: string[] = [];
    for await (const chunk of executeStreaming({
      promptPackage: createPromptPackageFixture(),
      service,
      requestId: "stream-1",
      executedAt: FIXED_TIMESTAMP,
    })) {
      chunks.push(chunk.delta);
    }

    expect(chunks.join("")).toBe("Hello");
  });

  it("listAvailableModels returns available catalog entries", () => {
    const service = createOpenAIProviderService({
      configuration: createProviderConfiguration(),
      client: createMockTransport(),
    });

    const models = listAvailableModels({ service });
    expect(models.every((model) => model.available)).toBe(true);
    expect(models.some((model) => model.id === "gpt-4o-mini")).toBe(true);
  });
});

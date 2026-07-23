import {
  checkHealth,
  executePrompt,
  listAvailableModels,
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
  it("executePrompt returns standardized AIResponse", async () => {
    const service = createOpenAIProviderService({
      configuration: createProviderConfiguration(),
      client: createMockTransport(
        createOpenAIResponseFixture({ content: "app reply" }),
      ),
    });

    const response = await executePrompt({
      promptPackage: createPromptPackageFixture(),
      service,
      requestId: "app-1",
      executedAt: FIXED_TIMESTAMP,
    });

    expect(response.content).toBe("app reply");
    expect(response.requestId).toBe("app-1");
  });

  it("checkHealth returns health snapshot", async () => {
    const service = createOpenAIProviderService({
      configuration: createProviderConfiguration(),
      client: createMockTransport(),
    });

    const health = await checkHealth({ service });
    expect(health.healthy).toBe(true);
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

import { AIProviderIds } from "../../ai-provider/models/AIProviderId";
import { executeAI, summarizeExecution } from "../application";
import {
  createOpenAIExecutionHarness,
  createPromptPackageFixture,
  createTestExecutionHarness,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";

describe("ai-execution integration", () => {
  it("orchestrates PromptPackage → pipeline → stub provider → AIResponse", async () => {
    const { service, providerId } = createTestExecutionHarness();

    const result = await executeAI({
      promptPackage: createPromptPackageFixture({
        id: "prompt-package:integration",
      }),
      providerId,
      service,
      requestId: "integration-1",
      createdAt: FIXED_TIMESTAMP,
    });

    expect(result.status).toBe("succeeded");
    expect(result.response?.providerId).toBe(providerId);
    expect(result.trace.steps.length).toBe(6);
    expect(summarizeExecution({ result, service }).succeeded).toBe(true);
  });

  it("consumes OpenAI Provider through provider-agnostic executor", async () => {
    const { service, providerId } = createOpenAIExecutionHarness({
      content: "hello from openai integration",
    });

    const result = await executeAI({
      promptPackage: createPromptPackageFixture({
        id: "prompt-package:openai-integration",
      }),
      providerId,
      modelId: "gpt-4o-mini",
      service,
      requestId: "openai-integration-1",
      createdAt: FIXED_TIMESTAMP,
    });

    expect(providerId).toBe(AIProviderIds.OPENAI);
    expect(result.status).toBe("succeeded");
    expect(result.response?.content).toBe("hello from openai integration");
    expect(result.response?.providerId).toBe(AIProviderIds.OPENAI);
    expect(result.providerId).toBe(AIProviderIds.OPENAI);
  });
});

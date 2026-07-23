import {
  createExecutionContext,
  executeAI,
  summarizeExecution,
} from "../application";
import {
  createExecutionRequestFixture,
  createPromptPackageFixture,
  createTestExecutionHarness,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";

describe("ai-execution application", () => {
  it("executeAI returns pipeline result via public API", async () => {
    const { service, providerId } = createTestExecutionHarness();

    const result = await executeAI({
      promptPackage: createPromptPackageFixture(),
      providerId,
      service,
      requestId: "app-exec-1",
      createdAt: FIXED_TIMESTAMP,
    });

    expect(result.requestId).toBe("app-exec-1");
    expect(result.status).toBe("succeeded");
    expect(result.response).not.toBeNull();
  });

  it("createExecutionContext builds context without executing", () => {
    const { service } = createTestExecutionHarness();
    const request = createExecutionRequestFixture();

    const context = createExecutionContext({
      request,
      service,
      preparedAt: FIXED_TIMESTAMP,
    });

    expect(context.requestId).toBe(request.id);
    expect(context.provider).toBeNull();
    expect(context.state.status).toBe("pending");
  });

  it("summarizeExecution returns compact summary", async () => {
    const { service, providerId } = createTestExecutionHarness();
    const result = await executeAI({
      promptPackage: createPromptPackageFixture(),
      providerId,
      service,
      createdAt: FIXED_TIMESTAMP,
    });

    const summary = summarizeExecution({ result, service });
    expect(summary.succeeded).toBe(true);
    expect(summary.hasResponse).toBe(true);
    expect(summary.providerId).toBe(providerId);
  });
});

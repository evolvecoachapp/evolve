import { AIExecutionStatuses } from "../models/AIExecutionStatus";
import { AIExecutionStageOrder } from "../models/AIExecutionStage";
import {
  createExecutionRequestFixture,
  createTestExecutionHarness,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";

describe("ai-execution pipeline", () => {
  it("runs all stages and returns succeeded result", async () => {
    const { pipeline } = createTestExecutionHarness();
    const result = await pipeline.execute(createExecutionRequestFixture());

    expect(result.status).toBe(AIExecutionStatuses.SUCCEEDED);
    expect(result.response?.content).toContain("execution fixture");
    expect(result.trace.steps.map((step) => step.stage)).toEqual([
      ...AIExecutionStageOrder,
    ]);
    expect(result.lifecycle.completedAt).toBe(FIXED_TIMESTAMP);
    expect(Object.isFrozen(result)).toBe(true);
  });

  it("returns failed result when provider executor is missing", async () => {
    const { pipeline, registry } = createTestExecutionHarness({
      providerId: "test-provider",
    });
    // Register a different provider id on request than resolver
    const result = await pipeline.execute(
      createExecutionRequestFixture({ providerId: "other-provider" }),
    );

    expect(registry.has("test-provider")).toBe(true);
    expect(result.status).toBe(AIExecutionStatuses.FAILED);
    expect(result.error?.code).toMatch(/provider|executor/);
    expect(result.response).toBeNull();
  });

  it("returns cancelled result when cancellation requested", async () => {
    const { pipeline } = createTestExecutionHarness();
    const result = await pipeline.execute(
      createExecutionRequestFixture({
        cancellation: Object.freeze({
          requested: true,
          token: "cancel-1",
          reason: "user_cancelled",
          requestedAt: FIXED_TIMESTAMP,
        }),
        policy: Object.freeze({
          retry: Object.freeze({
            enabled: false,
            maxAttempts: null,
            backoffMs: null,
          }),
          timeout: Object.freeze({
            enabled: false,
            timeoutMs: null,
          }),
          cancellation: Object.freeze({
            enabled: true,
            token: "cancel-1",
          }),
          execution: Object.freeze({
            allowStreaming: false,
            allowTools: false,
            requireProvider: true,
          }),
        }),
      }),
    );

    expect(result.status).toBe(AIExecutionStatuses.CANCELLED);
    expect(result.error?.code).toBe("execution_cancelled");
  });

  it("collects metrics and summary", async () => {
    const { pipeline } = createTestExecutionHarness();
    const result = await pipeline.execute(createExecutionRequestFixture());

    expect(result.metrics.attemptCount).toBeGreaterThanOrEqual(1);
    expect(result.summary.succeeded).toBe(true);
    expect(result.summary.stageCount).toBe(AIExecutionStageOrder.length);
  });
});

import { AIExecutionStageOrder } from "../models/AIExecutionStage";
import { executeAI } from "../application";
import {
  createExecutionRequestFixture,
  createPromptPackageFixture,
  createTestExecutionHarness,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";

describe("ai-execution regression", () => {
  it("does not expose streaming execution", async () => {
    const { service, providerId } = createTestExecutionHarness();

    const result = await executeAI({
      promptPackage: createPromptPackageFixture(),
      providerId,
      service,
      options: Object.freeze({
        temperature: null,
        maxOutputTokens: null,
        topP: null,
        stopSequences: Object.freeze([] as string[]),
        stream: true,
        timeoutMs: null,
        retryLimit: null,
        attributes: Object.freeze({}),
      }),
      createdAt: FIXED_TIMESTAMP,
    });

    expect(result.status).toBe("failed");
    expect(result.error?.code).toMatch(/streaming/);
  });

  it("keeps stage order stable across successful runs", async () => {
    const { pipeline } = createTestExecutionHarness();
    const first = await pipeline.execute(createExecutionRequestFixture());
    const second = await pipeline.execute(
      createExecutionRequestFixture({ id: "ai-exec-req:second" }),
    );

    expect(first.trace.steps.map((s) => s.stage)).toEqual([
      ...AIExecutionStageOrder,
    ]);
    expect(second.trace.steps.map((s) => s.stage)).toEqual([
      ...AIExecutionStageOrder,
    ]);
  });

  it("never returns a mutable result object", async () => {
    const { service, providerId } = createTestExecutionHarness();
    const result = await executeAI({
      promptPackage: createPromptPackageFixture(),
      providerId,
      service,
      createdAt: FIXED_TIMESTAMP,
    });

    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.trace)).toBe(true);
    expect(Object.isFrozen(result.lifecycle)).toBe(true);
    expect(Object.isFrozen(result.summary)).toBe(true);
  });

  it("does not implement retry attempts beyond single execution", async () => {
    const { pipeline } = createTestExecutionHarness({
      executorError: new Error("boom"),
    });
    const result = await pipeline.execute(createExecutionRequestFixture());

    expect(result.status).toBe("failed");
    expect(result.metrics.attemptCount).toBeLessThanOrEqual(1);
  });
});

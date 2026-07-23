import { createAIProviderRegistry } from "../../ai-provider/registry/AIProviderRegistry";
import { createStubProvider } from "../../ai-provider/testSupport/fixtures";
import { EMPTY_LIFECYCLE } from "../models/AIExecutionLifecycle";
import { EMPTY_EXECUTION_METRICS } from "../models/AIExecutionMetrics";
import { AIExecutionStatuses } from "../models/AIExecutionStatus";
import { createEmptyTrace } from "../models/AIExecutionTrace";
import {
  createContextStage,
  createExecutionStage,
  createProviderResolutionStage,
  createValidationStage,
  type PipelineWorkingState,
} from "../stages";
import {
  createExecutionRequestFixture,
  createExecutorResolver,
  createStubExecutor,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";

function createWorkingState(
  overrides: Partial<PipelineWorkingState> = {},
): PipelineWorkingState {
  const request = overrides.request ?? createExecutionRequestFixture();
  return {
    request,
    context: null,
    provider: null,
    executor: null,
    response: null,
    result: null,
    trace: createEmptyTrace(`ai-exec:${request.id}`),
    lifecycle: EMPTY_LIFECYCLE,
    metrics: EMPTY_EXECUTION_METRICS,
    validationIssues: [],
    error: null,
    startedAt: FIXED_TIMESTAMP,
    now: FIXED_TIMESTAMP,
    stageStartedAt: {},
    ...overrides,
  };
}

describe("ai-execution stages", () => {
  it("ValidationStage accepts a valid request", () => {
    const next = createValidationStage().run(createWorkingState());
    expect(next.trace.steps[0]?.stage).toBe("validation");
    expect(next.lifecycle.completedStages).toContain("validation");
  });

  it("ValidationStage rejects streaming", () => {
    const request = createExecutionRequestFixture({
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
    });

    expect(() =>
      createValidationStage().run(createWorkingState({ request })),
    ).toThrow(/streaming_not_supported|Execution request invalid/);
  });

  it("ContextStage creates pipeline context", () => {
    const next = createContextStage().run(createWorkingState());
    expect(next.context?.id).toMatch(/^ai-exec-ctx:/);
    expect(next.context?.state.status).toBe(AIExecutionStatuses.PREPARING);
  });

  it("ProviderResolutionStage resolves provider and executor", () => {
    const registry = createAIProviderRegistry();
    registry.register(createStubProvider({ id: "test-provider" }));
    const executor = createStubExecutor({ providerId: "test-provider" });
    const deps = {
      registry,
      executorResolver: createExecutorResolver([executor]),
    };

    const next = createProviderResolutionStage().run(
      createWorkingState(),
      deps,
    );

    expect(next.provider?.id).toBe("test-provider");
    expect(next.executor?.providerId).toBe("test-provider");
  });

  it("ExecutionStage calls executor and captures response", async () => {
    const executor = createStubExecutor({
      providerId: "test-provider",
      response: undefined,
    });
    const state = createWorkingState({ executor });
    const next = await createExecutionStage().run(state, {
      registry: createAIProviderRegistry(),
      executorResolver: createExecutorResolver([executor]),
    });

    expect(next.response?.content).toContain("execution fixture");
    expect(next.metrics.attemptCount).toBe(1);
  });
});

import { createAIProviderRegistry } from "../../ai-provider/registry/AIProviderRegistry";
import { createStubProvider } from "../../ai-provider/testSupport/fixtures";
import { AIExecutionRequestBuilder } from "../builders/AIExecutionRequestBuilder";
import { AIExecutionResultBuilder } from "../builders/AIExecutionResultBuilder";
import { AIExecutionStatuses } from "../models/AIExecutionStatus";
import { AIExecutionStages } from "../models/AIExecutionStage";
import { createEmptyTrace } from "../models/AIExecutionTrace";
import {
  createExecutorResolver,
  createPromptPackageFixture,
  createStubExecutor,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";
import { validateExecutionContext } from "../validators/validateExecutionContext";
import { validateExecutionRequest } from "../validators/validateExecutionRequest";
import { validateExecutionResult } from "../validators/validateExecutionResult";
import { validatePipelineIntegrity } from "../validators/validatePipelineIntegrity";
import { validateProviderAvailability } from "../validators/validateProviderAvailability";
import { buildTrace, createTraceStep } from "../utils/buildTrace";

describe("ai-execution validators", () => {
  it("flags missing prompt package on request", () => {
    const issues = validateExecutionRequest(null);
    expect(issues).toContain("execution_request_missing");
  });

  it("flags streaming requests as unsupported", () => {
    const request = new AIExecutionRequestBuilder()
      .withId("req-1")
      .withPromptPackage(createPromptPackageFixture())
      .withProviderId("test-provider")
      .withOptions(
        Object.freeze({
          temperature: null,
          maxOutputTokens: null,
          topP: null,
          stopSequences: Object.freeze([] as string[]),
          stream: true,
          timeoutMs: null,
          retryLimit: null,
          attributes: Object.freeze({}),
        }),
      )
      .withCreatedAt(FIXED_TIMESTAMP)
      .build();

    expect(validateExecutionRequest(request)).toContain(
      "execution_request_streaming_not_supported",
    );
  });

  it("validates provider availability and executor presence", () => {
    const registry = createAIProviderRegistry();
    registry.register(createStubProvider({ id: "test-provider" }));
    const resolver = createExecutorResolver([
      createStubExecutor({ providerId: "test-provider" }),
    ]);

    expect(
      validateProviderAvailability({
        providerId: "test-provider",
        registry,
        executorResolver: resolver,
      }),
    ).toEqual([]);

    expect(
      validateProviderAvailability({
        providerId: "missing",
        registry,
        executorResolver: resolver,
      }).length,
    ).toBeGreaterThan(0);
  });

  it("validates pipeline stage order", () => {
    const steps = [
      AIExecutionStages.VALIDATION,
      AIExecutionStages.CONTEXT,
      AIExecutionStages.PROVIDER_RESOLUTION,
      AIExecutionStages.EXECUTION,
      AIExecutionStages.RESULT,
      AIExecutionStages.LIFECYCLE,
    ].map((stage) =>
      createTraceStep({
        stage,
        status: AIExecutionStatuses.SUCCEEDED,
        startedAt: FIXED_TIMESTAMP,
        completedAt: FIXED_TIMESTAMP,
      }),
    );

    expect(validatePipelineIntegrity(buildTrace("exec-1", steps))).toEqual([]);

    const bad = buildTrace("exec-1", [
      createTraceStep({
        stage: AIExecutionStages.EXECUTION,
        status: AIExecutionStatuses.SUCCEEDED,
        startedAt: FIXED_TIMESTAMP,
      }),
    ]);
    expect(validatePipelineIntegrity(bad)[0]).toMatch(/stage_order_invalid/);
  });

  it("validates succeeded result requires response", () => {
    const result = new AIExecutionResultBuilder()
      .withId("exec-1")
      .withRequestId("req-1")
      .withContextId("ctx-1")
      .withStatus(AIExecutionStatuses.SUCCEEDED)
      .withResponse(null)
      .withTrace(createEmptyTrace("exec-1"))
      .withCompletedAt(FIXED_TIMESTAMP)
      .build();

    expect(validateExecutionResult(result)).toContain(
      "execution_result_succeeded_without_response",
    );
  });

  it("flags missing execution context", () => {
    expect(validateExecutionContext(null)).toContain(
      "execution_context_missing",
    );
  });
});

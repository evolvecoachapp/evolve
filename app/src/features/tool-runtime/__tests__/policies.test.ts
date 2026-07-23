import { DefaultRetryPolicy } from "../policies/RetryPolicy";
import { DefaultTimeoutPolicy } from "../policies/TimeoutPolicy";
import { DefaultOrderingPolicy } from "../policies/OrderingPolicy";
import { DefaultFailurePolicy } from "../policies/FailurePolicy";
import { DefaultRecoveryPolicy } from "../policies/RecoveryPolicy";
import { DefaultSafetyPolicy } from "../policies/SafetyPolicy";
import { ToolResolver } from "../resolver/ToolResolver";
import { ToolExecutionPlanBuilder } from "../builders/ToolExecutionPlanBuilder";
import {
  createMockAdapterCatalog,
  createWorkoutActionPlanFixture,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";
import { EMPTY_TOOL_EXECUTION_METADATA } from "../models/ToolExecutionMetadata";

describe("tool-runtime policies", () => {
  it("default policies are structural only", () => {
    const actionPlan = createWorkoutActionPlanFixture();
    const resolver = new ToolResolver(createMockAdapterCatalog());
    const bindings = resolver.resolvePlan(actionPlan, "texec:p:1");
    const plan = new ToolExecutionPlanBuilder()
      .withId("texec:p:1")
      .withActionPlanId(actionPlan.id)
      .withSourceResponseId(actionPlan.sourceResponseId)
      .withSteps(Object.freeze(bindings.map((b) => b.executionStep)))
      .withSourcePlan(actionPlan)
      .withCreatedAt(FIXED_TIMESTAMP)
      .withFrozenAt(FIXED_TIMESTAMP)
      .build();

    expect(new DefaultRetryPolicy().maxAttempts(plan.steps[0])).toBe(1);
    expect(new DefaultTimeoutPolicy().timeoutMs(plan.steps[0])).toBeNull();
    expect(new DefaultOrderingPolicy().orderStepIds(plan)).toEqual(
      plan.orderedStepIds,
    );
    expect(new DefaultSafetyPolicy().isSafe(plan)).toBe(true);

    const failureAction = new DefaultFailurePolicy().onFailure(
      Object.freeze({
        kind: "failure" as const,
        success: null,
        failure: Object.freeze({
          stepId: plan.steps[0].id,
          toolId: null,
          adapterId: null,
          code: "x",
          message: "x",
          details: null,
          durationMs: null,
          completedAt: FIXED_TIMESTAMP,
        }),
      }),
    );
    expect(failureAction).toBe("abort");

    expect(
      new DefaultRecoveryPolicy().canRecover(
        Object.freeze({
          stepId: "s",
          toolId: null,
          adapterId: null,
          code: "x",
          message: "x",
          details: null,
          durationMs: null,
          completedAt: FIXED_TIMESTAMP,
        }),
      ),
    ).toBe(false);

    void EMPTY_TOOL_EXECUTION_METADATA;
  });
});

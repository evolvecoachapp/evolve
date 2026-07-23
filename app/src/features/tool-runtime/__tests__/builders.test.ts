import { ToolExecutionPlanBuilder } from "../builders/ToolExecutionPlanBuilder";
import { ExecutionContextBuilder } from "../builders/ExecutionContextBuilder";
import { ExecutionSummaryBuilder } from "../builders/ExecutionSummaryBuilder";
import { ToolResolver } from "../resolver/ToolResolver";
import {
  createMockAdapterCatalog,
  createWorkoutActionPlanFixture,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";
import { EMPTY_TOOL_EXECUTION_METADATA } from "../models/ToolExecutionMetadata";

describe("tool-runtime builders", () => {
  it("ToolExecutionPlanBuilder produces frozen plan", () => {
    const actionPlan = createWorkoutActionPlanFixture();
    const resolver = new ToolResolver(createMockAdapterCatalog());
    const bindings = resolver.resolvePlan(actionPlan, "texec:b:1");

    const plan = new ToolExecutionPlanBuilder()
      .withId("texec:b:1")
      .withActionPlanId(actionPlan.id)
      .withSourceResponseId(actionPlan.sourceResponseId)
      .withSteps(Object.freeze(bindings.map((b) => b.executionStep)))
      .withSourcePlan(actionPlan)
      .withCreatedAt(FIXED_TIMESTAMP)
      .withFrozenAt(FIXED_TIMESTAMP)
      .build();

    expect(Object.isFrozen(plan)).toBe(true);
    expect(plan.orderedStepIds).toHaveLength(1);
  });

  it("ExecutionContextBuilder requires core fields", () => {
    expect(() => new ExecutionContextBuilder().build()).toThrow(
      /missing required fields/,
    );

    const ctx = new ExecutionContextBuilder()
      .withId("ctx:1")
      .withPlanId("texec:1")
      .withActionPlanId("plan:1")
      .withSourceResponseId("coach:1")
      .withRequestedAt(FIXED_TIMESTAMP)
      .withMetadata(EMPTY_TOOL_EXECUTION_METADATA)
      .build();

    expect(Object.isFrozen(ctx)).toBe(true);
  });

  it("ExecutionSummaryBuilder.fromResult", () => {
    const summary = new ExecutionSummaryBuilder()
      .fromResult(
        Object.freeze({
          id: "result:1",
          requestId: "req:1",
          planId: "texec:1",
          actionPlanId: "plan:1",
          success: true,
          status: "succeeded" as const,
          results: Object.freeze([]),
          completedStepIds: Object.freeze(["a"]),
          failedStepIds: Object.freeze([] as string[]),
          skippedStepIds: Object.freeze([] as string[]),
          message: null,
          startedAt: FIXED_TIMESTAMP,
          completedAt: FIXED_TIMESTAMP,
          durationMs: 1,
        }),
      )
      .build();

    expect(summary.succeededCount).toBe(1);
    expect(summary.complete).toBe(true);
    expect(Object.isFrozen(summary)).toBe(true);
  });
});

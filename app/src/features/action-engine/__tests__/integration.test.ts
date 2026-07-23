import { buildActionPlan } from "../application";
import { PlanningActionExecutor } from "../executors/PlanningActionExecutor";
import { createExecutionContext } from "../executors/ExecutionContext";
import {
  createRichCoachResponseFixture,
  createTestEngineHarness,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";

describe("action-engine integration", () => {
  it("CoachResponse → ActionPlan → ExecutionPlan handoff (no tool execution)", () => {
    const { service } = createTestEngineHarness();
    const response = createRichCoachResponseFixture({ id: "coach:int:1" });

    const pkg = buildActionPlan({
      service,
      response,
      createdAt: FIXED_TIMESTAMP,
      planId: "plan:int:1",
    });

    expect(pkg.plan.sourceResponseId).toBe(response.id);
    expect(pkg.context.sourceResponseId).toBe(response.id);
    expect(pkg.executionPlan).not.toBeNull();
    expect(pkg.executionPlan?.orderedStepIds.length).toBe(
      pkg.plan.steps.length,
    );

    const request = new PlanningActionExecutor().prepare(
      pkg.plan,
      createExecutionContext({
        id: "ctx:int",
        planId: pkg.plan.id,
        sourceResponseId: response.id,
        requestedAt: FIXED_TIMESTAMP,
        attributes: Object.freeze({}),
      }),
    );

    expect(request.executionPlan.planId).toBe(pkg.plan.id);
    expect(request.strategy.kind).toBe("dependency_order");
    // Contract only — PlanningActionExecutor does not implement execute()
    const executor: import("../executors/ActionExecutor").ActionExecutor =
      new PlanningActionExecutor();
    expect(executor.execute).toBeUndefined();
  });

  it("is compatible with Response Formatter CoachResponse shape", () => {
    const { service } = createTestEngineHarness();
    const response = createRichCoachResponseFixture();

    expect(response.actions).toBeDefined();
    expect(response.exercises).toBeDefined();
    expect(response.frozenAt).toBeTruthy();

    const pkg = buildActionPlan({
      service,
      response,
      createdAt: FIXED_TIMESTAMP,
    });

    expect(pkg.snapshot.statistics.stepCount).toBe(pkg.plan.steps.length);
  });
});

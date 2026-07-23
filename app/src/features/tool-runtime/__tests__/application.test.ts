import {
  buildExecutionPlan,
  describeRuntime,
  estimateExecution,
  executeActionPlan,
  validateExecution,
} from "../application";
import {
  createEmptyActionPlanFixture,
  createTestRuntimeHarness,
  createWorkoutActionPlanFixture,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";

describe("tool-runtime application", () => {
  it("describeRuntime returns frozen runtime descriptor", () => {
    const { service, adapters } = createTestRuntimeHarness();
    const runtime = describeRuntime({ service, adapters });
    expect(runtime.name).toBe("Tool Runtime Engine");
    expect(Object.isFrozen(runtime)).toBe(true);
    expect(runtime.adapterIds.length).toBeGreaterThan(0);
  });

  it("buildExecutionPlan resolves workout step to adapter", () => {
    const { service } = createTestRuntimeHarness();
    const plan = buildExecutionPlan({
      service,
      actionPlan: createWorkoutActionPlanFixture(),
      createdAt: FIXED_TIMESTAMP,
      planId: "texec:app:1",
    });

    expect(plan.id).toBe("texec:app:1");
    expect(plan.steps).toHaveLength(1);
    expect(plan.steps[0].toolId).toBe("domain.workout.generate");
    expect(plan.steps[0].adapterId).toBe("adapter.workout.mock");
    expect(Object.isFrozen(plan)).toBe(true);
  });

  it("validate / estimate work via public API", () => {
    const { service } = createTestRuntimeHarness();
    const plan = buildExecutionPlan({
      service,
      actionPlan: createWorkoutActionPlanFixture(),
      createdAt: FIXED_TIMESTAMP,
    });

    expect(validateExecution({ service, plan }).valid).toBe(true);
    const metrics = estimateExecution({ service, plan });
    expect(metrics.stepCount).toBe(1);
    expect(metrics.resolvedCount).toBe(1);
    expect(metrics.hasCycles).toBe(false);
  });

  it("executeActionPlan dispatches mock adapters", async () => {
    const { service } = createTestRuntimeHarness();
    const pkg = await executeActionPlan({
      service,
      actionPlan: createWorkoutActionPlanFixture(),
      createdAt: FIXED_TIMESTAMP,
      athleteId: "athlete-1",
    });

    expect(Object.isFrozen(pkg)).toBe(true);
    expect(pkg.result).not.toBeNull();
    expect(pkg.result!.success).toBe(true);
    expect(pkg.result!.completedStepIds).toHaveLength(1);
    expect(pkg.validation.valid).toBe(true);
  });

  it("empty ActionPlan dry-runs with no result", async () => {
    const { service } = createTestRuntimeHarness();
    const pkg = await executeActionPlan({
      service,
      actionPlan: createEmptyActionPlanFixture(),
      createdAt: FIXED_TIMESTAMP,
    });

    expect(pkg.plan.steps).toHaveLength(0);
    expect(pkg.request).toBeNull();
    expect(pkg.result).toBeNull();
  });
});

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

describe("tool-runtime regression", () => {
  it("public API surface remains stable", async () => {
    const { service } = createTestRuntimeHarness();
    const actionPlan = createWorkoutActionPlanFixture();

    const runtime = describeRuntime({ service });
    expect(runtime.version).toBe("1.0.0");

    const plan = buildExecutionPlan({
      service,
      actionPlan,
      createdAt: FIXED_TIMESTAMP,
    });
    expect(validateExecution({ service, plan }).valid).toBe(true);
    expect(estimateExecution({ service, plan }).estimatedUnits).toBeGreaterThan(
      0,
    );

    const pkg = await executeActionPlan({
      service,
      actionPlan,
      createdAt: FIXED_TIMESTAMP,
    });
    expect(pkg.result?.success).toBe(true);
  });

  it("empty plans remain skipped without dispatch", async () => {
    const { service } = createTestRuntimeHarness();
    const pkg = await executeActionPlan({
      service,
      actionPlan: createEmptyActionPlanFixture(),
      createdAt: FIXED_TIMESTAMP,
    });
    expect(pkg.plan.status).toBe("skipped");
    expect(pkg.result).toBeNull();
  });

  it("models stay frozen after execution", async () => {
    const { service } = createTestRuntimeHarness();
    const pkg = await executeActionPlan({
      service,
      actionPlan: createWorkoutActionPlanFixture(),
      createdAt: FIXED_TIMESTAMP,
    });
    expect(Object.isFrozen(pkg)).toBe(true);
    expect(Object.isFrozen(pkg.plan)).toBe(true);
    expect(Object.isFrozen(pkg.result!)).toBe(true);
  });
});

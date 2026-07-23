import {
  buildActionPlan,
  describeActions,
  estimateExecution,
  summarizeActionPlan,
  validateActionPlan,
} from "../application";
import {
  createEmptyCoachResponseFixture,
  createRichCoachResponseFixture,
  createTestEngineHarness,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";

describe("action-engine application", () => {
  it("buildActionPlan returns frozen ActionPackage", () => {
    const { service } = createTestEngineHarness();
    const pkg = buildActionPlan({
      service,
      response: createRichCoachResponseFixture(),
      createdAt: FIXED_TIMESTAMP,
      planId: "plan:app:1",
    });

    expect(pkg.plan.id).toBe("plan:app:1");
    expect(pkg.plan.steps.length).toBeGreaterThan(0);
    expect(Object.isFrozen(pkg)).toBe(true);
    expect(Object.isFrozen(pkg.plan)).toBe(true);
    expect(pkg.validation.valid).toBe(true);
  });

  it("summarize / validate / estimate / describe work via public API", () => {
    const { service } = createTestEngineHarness();
    const pkg = buildActionPlan({
      service,
      response: createRichCoachResponseFixture(),
      createdAt: FIXED_TIMESTAMP,
    });

    const summary = summarizeActionPlan({ service, plan: pkg.plan });
    expect(summary.stepCount).toBe(pkg.plan.steps.length);

    expect(validateActionPlan({ service, plan: pkg.plan }).valid).toBe(true);

    const metrics = estimateExecution({ service, plan: pkg.plan });
    expect(metrics.stepCount).toBe(pkg.plan.steps.length);
    expect(metrics.hasCycles).toBe(false);

    const descriptions = describeActions({ service, plan: pkg.plan });
    expect(descriptions.length).toBe(pkg.plan.steps.length);
  });

  it("empty CoachResponse yields skipped plan with no steps", () => {
    const { service } = createTestEngineHarness();
    const pkg = buildActionPlan({
      service,
      response: createEmptyCoachResponseFixture(),
      createdAt: FIXED_TIMESTAMP,
    });

    expect(pkg.plan.steps).toHaveLength(0);
    expect(pkg.plan.status).toBe("skipped");
    expect(pkg.executionPlan).toBeNull();
  });
});

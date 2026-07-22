import {
  createSampleProgressionPlan,
  createTestAdaptationContext,
} from "../../testSupport/fixtures";
import {
  ConstraintAssessmentStrategy,
  ExecutionReadinessStrategy,
  FatigueAssessmentStrategy,
  RecoveryAssessmentStrategy,
  createDefaultAssessments,
} from "../index";

describe("training adaptation assessments", () => {
  it("createDefaultAssessments returns independent strategies", () => {
    const defaults = createDefaultAssessments();
    expect(defaults.recovery.id).toBe("recovery");
    expect(defaults.fatigue.id).toBe("fatigue");
    expect(defaults.constraint.id).toBe("constraint");
    expect(defaults.execution.id).toBe("execution_readiness");
  });

  it("RecoveryAssessmentStrategy returns a frozen assessment", async () => {
    const context = await createTestAdaptationContext();
    const plan = await createSampleProgressionPlan();
    const assessment = new RecoveryAssessmentStrategy().assess(context, plan);

    expect(["adequate", "limited", "insufficient"]).toContain(assessment.status);
    expect(assessment.score).toBeGreaterThanOrEqual(0);
    expect(assessment.score).toBeLessThanOrEqual(100);
    expect(Object.isFrozen(assessment)).toBe(true);
  });

  it("FatigueAssessmentStrategy returns a frozen assessment", async () => {
    const context = await createTestAdaptationContext();
    const plan = await createSampleProgressionPlan();
    const assessment = new FatigueAssessmentStrategy().assess(context, plan);

    expect(["low", "moderate", "high", "excessive"]).toContain(assessment.level);
    expect(Object.isFrozen(assessment)).toBe(true);
  });

  it("ConstraintAssessmentStrategy summarizes constraints", async () => {
    const context = await createTestAdaptationContext();
    const plan = await createSampleProgressionPlan();
    const assessment = new ConstraintAssessmentStrategy().assess(
      context,
      plan,
    );

    expect(assessment.hardCount).toBeGreaterThanOrEqual(0);
    expect(assessment.softCount).toBeGreaterThanOrEqual(0);
    expect(Object.isFrozen(assessment)).toBe(true);
  });

  it("ExecutionReadinessStrategy returns confidence 0–100", async () => {
    const context = await createTestAdaptationContext();
    const plan = await createSampleProgressionPlan();
    const assessment = new ExecutionReadinessStrategy().assess(context, plan);

    expect(assessment.executionConfidence).toBeGreaterThanOrEqual(0);
    expect(assessment.executionConfidence).toBeLessThanOrEqual(100);
    expect(Object.isFrozen(assessment)).toBe(true);
  });
});

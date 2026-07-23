import {
  NutritionRequestBuilder,
  NutritionResultBuilder,
  NutritionContextBuilder,
  NutritionPlanBuilder,
} from "../builders";
import {
  createFixedClock,
  createNutritionRequestFixture,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";
import { NutritionIntents } from "../models/NutritionIntent";
import { NutritionGoals } from "../models/NutritionGoal";
import { NutritionDomainInvocationStatuses } from "../models/NutritionDomainInvocation";
import { NutritionCapabilities } from "../models/NutritionCapability";

describe("nutrition-agent builders", () => {
  it("NutritionRequestBuilder builds frozen agent request", () => {
    const request = new NutritionRequestBuilder().build({
      id: "nreq:builder:1",
      message: "Adjust my macros",
      createdAt: FIXED_TIMESTAMP,
      intentHint: NutritionIntents.ADJUST_MACROS,
      goalHint: NutritionGoals.MAINTENANCE,
    });
    expect(request.id).toBe("nreq:builder:1");
    expect(request.intentHint).toBe(NutritionIntents.ADJUST_MACROS);
    expect(Object.isFrozen(request)).toBe(true);
  });

  it("NutritionResultBuilder builds plan summary and evaluation", () => {
    const clock = createFixedClock();
    const context = new NutritionContextBuilder().build({
      request: createNutritionRequestFixture(),
      clock,
    });
    const plan = new NutritionPlanBuilder().buildProposal({ context, clock });
    const builder = new NutritionResultBuilder();
    const summary = builder.buildPlanSummary(plan);
    expect(summary.planId).toBe(plan.id);
    expect(summary.targetCalories).toBe(plan.calorieTargets.targetCalories);
    expect(Object.isFrozen(summary)).toBe(true);

    const evaluation = builder.buildEvaluation({
      id: "eval:1",
      planId: plan.id,
      validation: Object.freeze({ valid: true, issues: Object.freeze([]) }),
      findings: Object.freeze(["ok"]),
      evaluatedAt: FIXED_TIMESTAMP,
    });
    expect(evaluation.validation.valid).toBe(true);
    expect(evaluation.findings).toEqual(["ok"]);
  });

  it("NutritionResultBuilder attaches domain invocations", () => {
    const builder = new NutritionResultBuilder();
    const base = {
      id: "nresult:1",
      domainInvocations: Object.freeze([]),
    } as unknown as import("../models/NutritionAgentResult").NutritionAgentResult;
    const withInvocations = builder.withDomainInvocations(
      base,
      Object.freeze([
        Object.freeze({
          id: "ndomain:1",
          capability: NutritionCapabilities.ANALYZE_NUTRITION,
          status: NutritionDomainInvocationStatuses.SELECTED,
          summary: "selected",
          resultRef: null,
          attributes: Object.freeze({}),
          invokedAt: FIXED_TIMESTAMP,
        }),
      ]),
    );
    expect(withInvocations.domainInvocations).toHaveLength(1);
  });
});

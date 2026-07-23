import {
  buildNutritionPlan,
  describeNutritionCapabilities,
  evaluateNutrition,
  processNutritionRequest,
  validateNutritionPlan,
} from "../application";
import {
  createTestAgentService,
  createNutritionRequestFixture,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";

describe("nutrition-agent application", () => {
  it("describeNutritionCapabilities returns frozen agent", () => {
    const service = createTestAgentService();
    const agent = describeNutritionCapabilities({ service });
    expect(agent.name).toBe("Nutrition Agent");
    expect(agent.capabilities.length).toBeGreaterThan(0);
    expect(Object.isFrozen(agent)).toBe(true);
  });

  it("processNutritionRequest returns immutable result", () => {
    const service = createTestAgentService();
    const result = processNutritionRequest({
      service,
      request: createNutritionRequestFixture(),
    });
    expect(result.success).toBe(true);
    expect(result.decision.accepted).toBe(true);
    expect(result.decision.plan).not.toBeNull();
    expect(Object.isFrozen(result)).toBe(true);
    expect(result.startedAt).toBe(FIXED_TIMESTAMP);
  });

  it("buildNutritionPlan / evaluate / validate work via public API", () => {
    const service = createTestAgentService();
    const plan = buildNutritionPlan({
      service,
      request: createNutritionRequestFixture(),
    });
    expect(plan.phaseHint).toBeTruthy();
    expect(evaluateNutrition({ service, plan }).valid).toBe(true);
    expect(validateNutritionPlan({ service, plan }).valid).toBe(true);
  });
});

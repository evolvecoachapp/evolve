import { processNutritionRequest, buildNutritionPlan } from "../application";
import {
  createTestAgentService,
  createNutritionRequestFixture,
} from "../testSupport/fixtures";

describe("nutrition-agent regression", () => {
  it("identical requests produce deterministic plans", () => {
    const service = createTestAgentService();
    const request = createNutritionRequestFixture();
    const a = buildNutritionPlan({ service, request });
    const b = buildNutritionPlan({ service, request });
    expect(a.phaseHint).toBe(b.phaseHint);
    expect(a.calorieTargets.targetCalories).toBe(
      b.calorieTargets.targetCalories,
    );
    expect(a.macroTargets.proteinG).toBe(b.macroTargets.proteinG);
  });

  it("result remains frozen after process", () => {
    const service = createTestAgentService();
    const result = processNutritionRequest({
      service,
      request: createNutritionRequestFixture(),
    });
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.decision)).toBe(true);
    expect(Object.isFrozen(result.context)).toBe(true);
    expect(Object.isFrozen(result.domainInvocations)).toBe(true);
    const before = result.success;
    try {
      // @ts-expect-error intentional mutation attempt
      result.success = !before;
    } catch {
      // strict mode may throw; non-strict silently ignores
    }
    expect(result.success).toBe(before);
  });
});

import { adaptNutrition } from "../application";
import { applyNutritionAdaptationPolicy } from "../policies/NutritionAdaptationPolicy";
import { applySafetyPolicy } from "../policies/SafetyPolicy";
import {
  createNutritionAdaptationInput,
  createTestNutritionAdaptationEngineService,
} from "../testSupport/fixtures";

describe("nutrition-adaptation policies", () => {
  it("allows valid adapted packages", () => {
    const service = createTestNutritionAdaptationEngineService();
    const result = adaptNutrition({
      service,
      input: createNutritionAdaptationInput(),
    });
    expect(result.success).toBe(true);
    expect(applyNutritionAdaptationPolicy(result.adaptation).length).toBe(0);
    expect(applySafetyPolicy(result.package!).length).toBe(0);
  });
});

import { adaptNutrition } from "../application";
import { validateNutritionPackage } from "../validators";
import {
  createNutritionAdaptationInput,
  createTestNutritionAdaptationEngineService,
} from "../testSupport/fixtures";

describe("nutrition-adaptation validators", () => {
  it("validates successful adapt package", () => {
    const service = createTestNutritionAdaptationEngineService();
    const result = adaptNutrition({
      service,
      input: createNutritionAdaptationInput(),
    });
    expect(result.package).not.toBeNull();
    const validation = validateNutritionPackage(result.package!);
    expect(validation.valid).toBe(true);
    expect(Object.isFrozen(validation)).toBe(true);
  });
});

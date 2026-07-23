import {
  validateCalories,
  validateMacros,
  validateMealDistribution,
  validateProtein,
  validateNutritionPlan,
} from "../validators";
import { NutritionContextBuilder } from "../builders/NutritionContextBuilder";
import { NutritionPlanBuilder } from "../builders/NutritionPlanBuilder";
import {
  createNutritionRequestFixture,
  createFixedClock,
} from "../testSupport/fixtures";

describe("nutrition-agent validators", () => {
  it("validateCalories rejects extreme values", () => {
    expect(validateCalories(100).valid).toBe(false);
    expect(validateCalories(2200).valid).toBe(true);
  });

  it("validateProtein rejects extremes", () => {
    expect(validateProtein(10).valid).toBe(false);
    expect(validateProtein(160).valid).toBe(true);
  });

  it("validateNutritionPlan accepts builder output", () => {
    const clock = createFixedClock();
    const context = new NutritionContextBuilder().build({
      request: createNutritionRequestFixture(),
      clock,
    });
    const plan = new NutritionPlanBuilder().buildProposal({ context, clock });
    const validation = validateNutritionPlan(plan);
    expect(validation.valid).toBe(true);
    expect(validateMacros(plan.macroTargets).valid).toBe(true);
    expect(validateMealDistribution(plan.mealDistribution).valid).toBe(true);
  });
});

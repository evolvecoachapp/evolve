import {
  DefaultSafetyPolicy,
  DefaultCaloriePolicy,
  DefaultMacroPolicy,
  DefaultMealPolicy,
} from "../policies";
import { NutritionContextBuilder } from "../builders/NutritionContextBuilder";
import { NutritionPlanBuilder } from "../builders/NutritionPlanBuilder";
import {
  createNutritionRequestFixture,
  createFixedClock,
} from "../testSupport/fixtures";

describe("nutrition-agent policies", () => {
  const clock = createFixedClock();
  const context = new NutritionContextBuilder().build({
    request: createNutritionRequestFixture(),
    clock,
  });
  const plan = new NutritionPlanBuilder().buildProposal({ context, clock });

  it("safety and calorie policies return frozen arrays", () => {
    const safety = new DefaultSafetyPolicy().evaluate(context, plan);
    const calories = new DefaultCaloriePolicy().evaluate(plan);
    expect(Object.isFrozen(safety)).toBe(true);
    expect(Object.isFrozen(calories)).toBe(true);
  });

  it("macro and meal policies accept valid plans", () => {
    expect(new DefaultMacroPolicy().evaluate(plan).length).toBe(0);
    expect(new DefaultMealPolicy().evaluate(plan).length).toBe(0);
  });
});

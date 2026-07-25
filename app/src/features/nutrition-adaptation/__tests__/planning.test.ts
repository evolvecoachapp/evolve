import { planNutritionAdaptation } from "../planning";

describe("nutrition-adaptation planning", () => {
  it("returns immutable plan step/target keys from decision keys", () => {
    const plans = planNutritionAdaptation({
      id: "plan-test",
      decisionKeys: Object.freeze([
        "decision:key:calorie",
        "decision:key:macro",
        "decision:key:hydration",
      ]),
      signalKeys: Object.freeze(["state:hydration"]),
      planKeys: Object.freeze(["plan:1"]),
      mealKeys: Object.freeze(["meal:breakfast"]),
      macroKeys: Object.freeze(["macro:protein"]),
      timingKeys: Object.freeze(["timing:pre"]),
      weekKeys: Object.freeze(["week:1"]),
    });
    expect(Object.isFrozen(plans)).toBe(true);
    expect(Object.isFrozen(plans.nutrition)).toBe(true);
    expect(plans.nutrition.stepKeys.length).toBeGreaterThan(0);
    expect(plans.meal.targetKeys).toContain("target:meal:breakfast");
    expect(plans.macro.stepKeys.some((k) => k.includes("macro") || k.includes("calorie"))).toBe(
      true,
    );
  });
});

import {
  evaluateAdherence,
  evaluateCalorie,
  evaluateConsistency,
  evaluateHydration,
  evaluateMacro,
  evaluateMealTiming,
  evaluateNutritionSignals,
  evaluateRecoveryNutrition,
} from "../evaluation";

describe("nutrition-adaptation evaluation", () => {
  it("returns frozen ordinals from signal keys", () => {
    const keys = Object.freeze([
      "decision:key:calorie",
      "decision:key:macro",
      "state:hydration",
      "state:recovery",
      "state:adherence",
    ]);
    const calorie = evaluateCalorie(keys);
    expect(calorie.present).toBe(true);
    expect(Object.isFrozen(calorie)).toBe(true);
    expect(Object.isFrozen(calorie.matchedKeys)).toBe(true);

    expect(evaluateMacro(keys).present).toBe(true);
    expect(evaluateHydration(keys).present).toBe(true);
    expect(evaluateRecoveryNutrition(keys).present).toBe(true);
    expect(evaluateAdherence(keys).present).toBe(true);
    expect(evaluateMealTiming(keys).present).toBe(false);
    expect(evaluateConsistency(keys).present).toBe(false);

    const bundle = evaluateNutritionSignals(keys);
    expect(Object.isFrozen(bundle)).toBe(true);
    expect(bundle.calorie.ordinal).toBeLessThanOrEqual(3);
  });
});

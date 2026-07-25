import { planWorkoutAdaptation } from "../planning";

describe("workout-adaptation planning", () => {
  it("returns immutable plan step/target keys from decision keys", () => {
    const plans = planWorkoutAdaptation({
      id: "plan-test",
      decisionKeys: Object.freeze([
        "decision:key:volume",
        "decision:key:progression",
        "decision:key:frequency",
      ]),
      signalKeys: Object.freeze(["state:fatigue"]),
      blueprintKeys: Object.freeze(["blueprint:1"]),
      exerciseKeys: Object.freeze(["exercise:squat"]),
      sessionKeys: Object.freeze(["session:a"]),
      weekKeys: Object.freeze(["week:1"]),
    });
    expect(Object.isFrozen(plans)).toBe(true);
    expect(Object.isFrozen(plans.workout)).toBe(true);
    expect(plans.workout.stepKeys.length).toBeGreaterThan(0);
    expect(plans.exercise.targetKeys).toContain("target:exercise:squat");
    expect(plans.progression.stepKeys.some((k) => k.includes("progression"))).toBe(true);
  });
});

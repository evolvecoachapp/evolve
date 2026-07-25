import {
  evaluateHRV,
  evaluateSleep,
  evaluateConsistency,
  evaluateStress,
  evaluateFatigue,
  evaluateReadiness,
  evaluateRecoverySignals,
  evaluateRecovery,
} from "../evaluation";

describe("recovery-adaptation evaluation", () => {
  it("returns frozen ordinals from signal keys", () => {
    const keys = Object.freeze([
      "decision:key:sleep",
      "decision:key:protocol",
      "state:stress",
      "state:recovery",
      "state:hrv",
    ]);
    const sleep = evaluateSleep(keys);
    expect(sleep.present).toBe(true);
    expect(Object.isFrozen(sleep)).toBe(true);
    expect(Object.isFrozen(sleep.matchedKeys)).toBe(true);

    expect(evaluateFatigue(keys).present).toBe(true);
    expect(evaluateStress(keys).present).toBe(true);
    expect(evaluateRecovery(keys).present).toBe(true);
    expect(evaluateHRV(keys).present).toBe(true);
    expect(evaluateReadiness(keys).present).toBe(false);
    expect(evaluateConsistency(keys).present).toBe(false);

    const bundle = evaluateRecoverySignals(keys);
    expect(Object.isFrozen(bundle)).toBe(true);
    expect(bundle.sleep.ordinal).toBeLessThanOrEqual(3);
  });
});

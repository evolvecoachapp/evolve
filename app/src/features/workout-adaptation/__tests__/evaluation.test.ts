import {
  evaluateConsistency,
  evaluateFatigue,
  evaluateFrequency,
  evaluateIntensity,
  evaluatePlateau,
  evaluateProgression,
  evaluateRecovery,
  evaluateVolume,
  evaluateWorkoutSignals,
} from "../evaluation";

describe("workout-adaptation evaluation", () => {
  it("returns frozen ordinals from signal keys", () => {
    const keys = Object.freeze([
      "decision:key:volume",
      "decision:key:intensity",
      "state:fatigue",
      "state:recovery",
      "decision:key:progression",
    ]);
    const volume = evaluateVolume(keys);
    expect(volume.present).toBe(true);
    expect(Object.isFrozen(volume)).toBe(true);
    expect(Object.isFrozen(volume.matchedKeys)).toBe(true);

    expect(evaluateIntensity(keys).present).toBe(true);
    expect(evaluateFatigue(keys).present).toBe(true);
    expect(evaluateRecovery(keys).present).toBe(true);
    expect(evaluateProgression(keys).present).toBe(true);
    expect(evaluateFrequency(keys).present).toBe(false);
    expect(evaluatePlateau(keys).present).toBe(false);
    expect(evaluateConsistency(keys).present).toBe(false);

    const bundle = evaluateWorkoutSignals(keys);
    expect(Object.isFrozen(bundle)).toBe(true);
    expect(bundle.volume.ordinal).toBeLessThanOrEqual(3);
  });
});

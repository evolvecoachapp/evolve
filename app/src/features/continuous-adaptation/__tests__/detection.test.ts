import { detectAdherence } from "../detection/AdherenceDetector";
import { detectConsistency } from "../detection/ConsistencyDetector";
import { detectPlateau } from "../detection/PlateauDetector";
import { detectProgress } from "../detection/ProgressDetector";
import { detectRecovery } from "../detection/RecoveryDetector";
import { detectRegression } from "../detection/RegressionDetector";
import { detectTrend } from "../detection/TrendDetector";
import { createAdaptationInput } from "../testSupport/fixtures";

describe("continuous-adaptation detection", () => {
  it("detects signal key/flag presence only", () => {
    const input = createAdaptationInput();
    const plateau = detectPlateau(input);
    expect(plateau.triggers.length).toBeGreaterThan(0);
    expect(plateau.triggers.every((t) => t.present)).toBe(true);
    expect(Object.isFrozen(plateau.triggers[0])).toBe(true);

    expect(detectProgress(input).candidates.length).toBeGreaterThan(0);
    expect(detectRecovery(input).opportunities.length).toBeGreaterThan(0);
    expect(detectTrend(input).triggers.some((t) => t.signalKey.includes("trend"))).toBe(true);

    const empty = createAdaptationInput({
      performanceKeys: Object.freeze([]),
      recoveryKeys: Object.freeze([]),
      nutritionKeys: Object.freeze([]),
      goalKeys: Object.freeze([]),
      adherenceKeys: Object.freeze([]),
      historyKeys: Object.freeze([]),
      timelineKeys: Object.freeze([]),
      stateKeys: Object.freeze([]),
      signalFlags: Object.freeze({}),
    });
    expect(detectRegression(empty).triggers.length).toBe(0);
    expect(detectConsistency(empty).candidates.length).toBe(0);
    expect(detectAdherence(empty).opportunities.length).toBe(0);
  });
});

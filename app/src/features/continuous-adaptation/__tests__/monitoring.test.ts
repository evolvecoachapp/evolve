import { observeAdherence } from "../monitoring/AdherenceMonitor";
import { observeGoal } from "../monitoring/GoalMonitor";
import { observeHistory } from "../monitoring/HistoryMonitor";
import { observeNutrition } from "../monitoring/NutritionMonitor";
import { observePerformance } from "../monitoring/PerformanceMonitor";
import { observeRecovery } from "../monitoring/RecoveryMonitor";
import { observeState } from "../monitoring/StateMonitor";
import { observeTimeline } from "../monitoring/TimelineMonitor";
import { createAdaptationInput, FIXED_TIMESTAMP } from "../testSupport/fixtures";

describe("continuous-adaptation monitoring", () => {
  it("returns frozen observation records with key/flag counts only", () => {
    const input = createAdaptationInput();
    const at = FIXED_TIMESTAMP;
    const obs = [
      observeState(input, at),
      observePerformance(input, at),
      observeRecovery(input, at),
      observeNutrition(input, at),
      observeGoal(input, at),
      observeAdherence(input, at),
      observeHistory(input, at),
      observeTimeline(input, at),
    ];
    for (const o of obs) {
      expect(Object.isFrozen(o)).toBe(true);
      expect(Object.isFrozen(o.keys)).toBe(true);
      expect(typeof o.presentCount).toBe("number");
      expect(o.createdAt).toBe(at);
    }
    expect(observeState(input, at).presentCount).toBe(2);
    expect(observeRecovery(input, at).flagsPresent).toContain("recovery:flag");
  });
});

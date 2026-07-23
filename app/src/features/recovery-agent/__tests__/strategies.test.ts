import { createDefaultStrategies } from "../strategies";
import { RecoveryGoals } from "../models/RecoveryGoal";

describe("recovery-agent strategies", () => {
  it("matches goals and freezes describe()", () => {
    const strategies = createDefaultStrategies();
    expect(strategies.length).toBeGreaterThanOrEqual(9);
    const full = strategies.find((s) => s.matches(RecoveryGoals.FULL_RECOVERY));
    expect(full).toBeTruthy();
    expect(Object.isFrozen(full!.describe())).toBe(true);
    const fallback = strategies[strategies.length - 1];
    expect(fallback.matches(RecoveryGoals.UNKNOWN)).toBe(true);
  });
});

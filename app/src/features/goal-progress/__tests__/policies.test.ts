import { applyGoalProgressPolicy } from "../policies/GoalProgressPolicy";
import { applyConsistencyPolicy } from "../policies/ConsistencyPolicy";
import { applyMilestonePolicy } from "../policies/MilestonePolicy";
import { applyTrackingPolicy } from "../policies/TrackingPolicy";
import { applySafetyPolicy } from "../policies/SafetyPolicy";
import {
  createGoalProgressInput,
  createTestGoalProgressEngineService,
} from "../testSupport/fixtures";

describe("goal-progress policies", () => {
  it("passes structural policies on successful evaluate path", () => {
    const service = createTestGoalProgressEngineService();
    const input = createGoalProgressInput();
    const result = service.evaluateGoalProgress(input);
    expect(result.success).toBe(true);

    expect(applyTrackingPolicy(input)).toHaveLength(0);
    expect(applyMilestonePolicy(result.decisions[0]!.triggers)).toHaveLength(0);
    expect(applyGoalProgressPolicy(result.decisions)).toHaveLength(0);
    expect(applyConsistencyPolicy(result.decisions)).toHaveLength(0);
    expect(applyConsistencyPolicy(result.decisions)).toHaveLength(0);
    expect(applySafetyPolicy(result.package!)).toHaveLength(0);
  });

  it("flags missing athlete for monitoring policy", () => {
    const input = createGoalProgressInput({ athleteId: "" });
    expect(applyTrackingPolicy(input).length).toBeGreaterThan(0);
  });
});

import { trackAdherence } from "../tracking/AdherenceTracker";
import { trackGoal } from "../tracking/GoalTracker";
import { trackHistory } from "../tracking/HistoryTracker";
import { trackNutritionAdherence } from "../tracking/NutritionAdherenceTracker";
import { trackMilestone } from "../tracking/MilestoneTracker";
import { trackAchievement } from "../tracking/AchievementTracker";
import { trackConsistency } from "../tracking/ConsistencyTracker";
import { trackTimelineHistory } from "../tracking/TimelineHistoryTracker";
import { createGoalProgressInput, FIXED_TIMESTAMP } from "../testSupport/fixtures";

describe("goal-progress monitoring", () => {
  it("returns frozen observation records with key/flag counts only", () => {
    const input = createGoalProgressInput();
    const at = FIXED_TIMESTAMP;
    const obs = [
      trackConsistency(input, at),
      trackMilestone(input, at),
      trackAchievement(input, at),
      trackNutritionAdherence(input, at),
      trackGoal(input, at),
      trackAdherence(input, at),
      trackHistory(input, at),
      trackTimelineHistory(input, at),
    ];
    for (const o of obs) {
      expect(Object.isFrozen(o)).toBe(true);
      expect(Object.isFrozen(o.keys)).toBe(true);
      expect(typeof o.presentCount).toBe("number");
      expect(o.createdAt).toBe(at);
    }
    expect(trackConsistency(input, at).presentCount).toBe(2);
    expect(trackAchievement(input, at).flagsPresent).toContain("recovery:flag");
  });
});

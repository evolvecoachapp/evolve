import { GoalProgressExperienceError } from "../services/GoalProgressExperienceService";
import type { GoalProgressExperienceService } from "../services/GoalProgressExperienceService";

function notConfigured(): never {
  throw new GoalProgressExperienceError(
    "Local Goal Progress Experience provider is not configured.",
    "local",
  );
}

export const localGoalProgressExperienceService: GoalProgressExperienceService = {
  providerId: "local",
  getDashboard: notConfigured,
  updateProgress: notConfigured,
  completeMilestone: notConfigured,
  completeGoal: notConfigured,
};

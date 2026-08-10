import { GoalProgressExperienceError } from "../services/GoalProgressExperienceService";
import type { GoalProgressExperienceService } from "../services/GoalProgressExperienceService";

function notConfigured(): never {
  throw new GoalProgressExperienceError(
    "Backend Goal Progress Experience provider is not configured.",
    "backend",
  );
}

export const backendGoalProgressExperienceService: GoalProgressExperienceService = {
  providerId: "backend",
  getDashboard: notConfigured,
  updateProgress: notConfigured,
  completeMilestone: notConfigured,
  completeGoal: notConfigured,
};

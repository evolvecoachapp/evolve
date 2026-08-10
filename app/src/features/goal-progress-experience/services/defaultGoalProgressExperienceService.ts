import { backendGoalProgressExperienceService } from "../providers/BackendGoalProgressExperienceService";
import { localGoalProgressExperienceService } from "../providers/LocalGoalProgressExperienceService";
import { mockGoalProgressExperienceService } from "../providers/MockGoalProgressExperienceService";
import type {
  GoalProgressExperienceProviderId,
  GoalProgressExperienceService,
} from "./GoalProgressExperienceService";

function resolveProviderId(): GoalProgressExperienceProviderId {
  const candidate = process.env.EXPO_PUBLIC_GOAL_PROGRESS_EXPERIENCE_PROVIDER;
  if (candidate === "backend" || candidate === "local" || candidate === "mock") {
    return candidate;
  }
  return "mock";
}

export function createGoalProgressExperienceService(): GoalProgressExperienceService {
  const providerId = resolveProviderId();
  if (providerId === "backend") {
    return backendGoalProgressExperienceService;
  }
  if (providerId === "local") {
    return localGoalProgressExperienceService;
  }
  return mockGoalProgressExperienceService;
}

export const goalProgressExperienceService = createGoalProgressExperienceService();

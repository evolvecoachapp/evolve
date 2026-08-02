import type { ProgressAnalyticsService } from "../../../features/progress-analytics/services/ProgressAnalyticsService";
import { createProgressAnalyticsService } from "../../../features/progress-analytics/services/progressAnalyticsFactory";
import {
  createWorkoutProgressIntegration,
  type WorkoutProgressIntegration,
} from "../../../integrations/workout-progress/composition/createWorkoutProgressIntegration";

export interface WorkoutProgressIntegrationFactoryDeps {
  readonly progressAnalyticsService?: ProgressAnalyticsService;
}

/**
 * Composition Root factory for Workout → Progress Analytics integration wiring.
 */
export const WorkoutProgressIntegrationFactory = {
  create(
    deps: WorkoutProgressIntegrationFactoryDeps = {},
  ): WorkoutProgressIntegration {
    const progressAnalyticsService =
      deps.progressAnalyticsService ?? createProgressAnalyticsService();
    return createWorkoutProgressIntegration({ progressAnalyticsService });
  },
} as const;

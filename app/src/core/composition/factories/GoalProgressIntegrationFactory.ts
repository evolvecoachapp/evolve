import type { ProgressAnalyticsService } from "../../../features/progress-analytics/services/ProgressAnalyticsService";
import { createProgressAnalyticsService } from "../../../features/progress-analytics/services/progressAnalyticsFactory";
import {
  createGoalProgressIntegration,
  type GoalProgressIntegration,
} from "../../../integrations/goal-progress/composition/createGoalProgressIntegration";

export interface GoalProgressIntegrationFactoryDeps {
  readonly progressAnalyticsService?: ProgressAnalyticsService;
}

/**
 * Composition Root factory for Goal → Progress Analytics integration wiring.
 */
export const GoalProgressIntegrationFactory = {
  create(
    deps: GoalProgressIntegrationFactoryDeps = {},
  ): GoalProgressIntegration {
    const progressAnalyticsService =
      deps.progressAnalyticsService ?? createProgressAnalyticsService();
    return createGoalProgressIntegration({ progressAnalyticsService });
  },
} as const;

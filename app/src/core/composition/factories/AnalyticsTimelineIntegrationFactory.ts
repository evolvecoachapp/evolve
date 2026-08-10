import type { ProgressAnalyticsService } from "../../../features/progress-analytics/services/ProgressAnalyticsService";
import { createProgressAnalyticsService } from "../../../features/progress-analytics/services/progressAnalyticsFactory";
import type { CoachTimelineService } from "../../../features/coach-timeline/services/CoachTimelineService";
import { createCoachTimelineService } from "../../../features/coach-timeline/services/CoachTimelineService";
import {
  createAnalyticsTimelineIntegration,
  type AnalyticsTimelineIntegration,
} from "../../../integrations/analytics-timeline/composition/createAnalyticsTimelineIntegration";

export interface AnalyticsTimelineIntegrationFactoryDeps {
  readonly progressAnalyticsService?: ProgressAnalyticsService;
  readonly coachTimelineService?: CoachTimelineService;
  readonly clock?: () => string;
}

/**
 * Composition Root factory for Progress Analytics → Coach Timeline projection wiring.
 */
export const AnalyticsTimelineIntegrationFactory = {
  create(
    deps: AnalyticsTimelineIntegrationFactoryDeps = {},
  ): AnalyticsTimelineIntegration {
    const progressAnalyticsService =
      deps.progressAnalyticsService ?? createProgressAnalyticsService();
    const coachTimelineService =
      deps.coachTimelineService ?? createCoachTimelineService();

    return createAnalyticsTimelineIntegration({
      progressAnalyticsService,
      coachTimelineService,
      clock: deps.clock,
    });
  },
} as const;

import type { ProgressAnalyticsService } from "../../../features/progress-analytics/services/ProgressAnalyticsService";
import type { CoachTimelineService } from "../../../features/coach-timeline/services/CoachTimelineService";
import {
  createAnalyticsTimelineProjector,
  type AnalyticsTimelineProjector,
} from "../projector";

export interface AnalyticsTimelineIntegration {
  readonly projector: AnalyticsTimelineProjector;
}

export interface CreateAnalyticsTimelineIntegrationOptions {
  readonly progressAnalyticsService: ProgressAnalyticsService;
  readonly coachTimelineService: CoachTimelineService;
  readonly clock?: () => string;
}

export function createAnalyticsTimelineIntegration(
  options: CreateAnalyticsTimelineIntegrationOptions,
): AnalyticsTimelineIntegration {
  const projector = createAnalyticsTimelineProjector({
    progressAnalyticsService: options.progressAnalyticsService,
    coachTimelineService: options.coachTimelineService,
    clock: options.clock,
  });

  return Object.freeze({ projector });
}

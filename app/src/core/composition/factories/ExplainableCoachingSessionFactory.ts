import {
  createExplainableCoachingSessionService,
  type ExplainableCoachingSessionService,
} from "../../../features/coaching-session/composition/services/ExplainableCoachingSessionService";
import type { CoachTimelineService } from "../../../features/coach-timeline/services/CoachTimelineService";
import type { PlanHistoryService } from "../../../features/plan-history/services/PlanHistoryService";
import type { ProactiveInsightsService } from "../../../features/proactive-insights/services/ProactiveInsightsService";

export interface ExplainableCoachingSessionFactoryDeps {
  readonly coachTimeline?: CoachTimelineService | null;
  readonly planHistory?: PlanHistoryService | null;
  readonly proactiveInsights?: ProactiveInsightsService | null;
  readonly clock?: () => string;
  readonly service?: ExplainableCoachingSessionService;
}

export const ExplainableCoachingSessionFactory = {
  create(
    deps: ExplainableCoachingSessionFactoryDeps = {},
  ): ExplainableCoachingSessionService {
    return (
      deps.service ??
      createExplainableCoachingSessionService({
        coachTimeline: deps.coachTimeline ?? null,
        planHistory: deps.planHistory ?? null,
        proactiveInsights: deps.proactiveInsights ?? null,
        clock: deps.clock,
      })
    );
  },
} as const;

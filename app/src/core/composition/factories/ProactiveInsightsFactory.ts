import {
  createProactiveInsightsService,
  type ProactiveInsightsService,
} from "../../../features/proactive-insights/services/ProactiveInsightsService";
import type { CoachTimelineService } from "../../../features/coach-timeline/services/CoachTimelineService";
import type { PlanHistoryService } from "../../../features/plan-history/services/PlanHistoryService";

export interface ProactiveInsightsFactoryDeps {
  readonly coachTimeline: CoachTimelineService;
  readonly planHistory?: PlanHistoryService | null;
  readonly clock?: () => string;
  readonly service?: ProactiveInsightsService;
}

export const ProactiveInsightsFactory = {
  create(deps: ProactiveInsightsFactoryDeps): ProactiveInsightsService {
    return (
      deps.service ??
      createProactiveInsightsService({
        coachTimeline: deps.coachTimeline,
        planHistory: deps.planHistory ?? null,
        clock: deps.clock,
      })
    );
  },
} as const;

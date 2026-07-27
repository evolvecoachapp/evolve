import {
  createHomeExperienceService,
  type HomeExperienceService,
} from "../../../features/home-experience/services/HomeExperienceService";
import type { CoachTimelineService } from "../../../features/coach-timeline/services/CoachTimelineService";
import type { ExplainableCoachingSessionService } from "../../../features/coaching-session/composition/services/ExplainableCoachingSessionService";
import type { PlanHistoryService } from "../../../features/plan-history/services/PlanHistoryService";
import type { ProactiveInsightsService } from "../../../features/proactive-insights/services/ProactiveInsightsService";

export interface HomeExperienceFactoryDeps {
  readonly coachTimeline?: CoachTimelineService | null;
  readonly planHistory?: PlanHistoryService | null;
  readonly proactiveInsights?: ProactiveInsightsService | null;
  readonly explainableCoachingSession?: ExplainableCoachingSessionService | null;
  readonly clock?: () => string;
  readonly service?: HomeExperienceService;
}

export const HomeExperienceFactory = {
  create(deps: HomeExperienceFactoryDeps = {}): HomeExperienceService {
    return (
      deps.service ??
      createHomeExperienceService({
        coachTimeline: deps.coachTimeline ?? null,
        planHistory: deps.planHistory ?? null,
        proactiveInsights: deps.proactiveInsights ?? null,
        explainableCoachingSession: deps.explainableCoachingSession ?? null,
        clock: deps.clock,
      })
    );
  },
} as const;

import {
  createDailyBriefService,
  type DailyBriefService,
} from "../../../features/daily-brief/services/DailyBriefService";
import type { CoachTimelineService } from "../../../features/coach-timeline/services/CoachTimelineService";
import type { ExplainableCoachingSessionService } from "../../../features/coaching-session/composition/services/ExplainableCoachingSessionService";
import type { HomeExperienceService } from "../../../features/home-experience/services/HomeExperienceService";
import type { PlanHistoryService } from "../../../features/plan-history/services/PlanHistoryService";
import type { ProactiveInsightsService } from "../../../features/proactive-insights/services/ProactiveInsightsService";

export interface DailyBriefFactoryDeps {
  readonly homeExperience?: HomeExperienceService | null;
  readonly coachTimeline?: CoachTimelineService | null;
  readonly planHistory?: PlanHistoryService | null;
  readonly proactiveInsights?: ProactiveInsightsService | null;
  readonly explainableCoachingSession?: ExplainableCoachingSessionService | null;
  readonly clock?: () => string;
  readonly service?: DailyBriefService;
}

export const DailyBriefFactory = {
  create(deps: DailyBriefFactoryDeps = {}): DailyBriefService {
    return (
      deps.service ??
      createDailyBriefService({
        homeExperience: deps.homeExperience ?? null,
        coachTimeline: deps.coachTimeline ?? null,
        planHistory: deps.planHistory ?? null,
        proactiveInsights: deps.proactiveInsights ?? null,
        explainableCoachingSession: deps.explainableCoachingSession ?? null,
        clock: deps.clock,
      })
    );
  },
} as const;

import {
  createWeeklyCoachReportService,
  type WeeklyCoachReportService,
} from "../../../features/weekly-report/services/WeeklyCoachReportService";
import type { CoachTimelineService } from "../../../features/coach-timeline/services/CoachTimelineService";
import type { ExplainableCoachingSessionService } from "../../../features/coaching-session/composition/services/ExplainableCoachingSessionService";
import type { DailyBriefService } from "../../../features/daily-brief/services/DailyBriefService";
import type { HomeExperienceService } from "../../../features/home-experience/services/HomeExperienceService";
import type { PlanHistoryService } from "../../../features/plan-history/services/PlanHistoryService";
import type { ProactiveInsightsService } from "../../../features/proactive-insights/services/ProactiveInsightsService";

export interface WeeklyCoachReportFactoryDeps {
  readonly dailyBrief?: DailyBriefService | null;
  readonly homeExperience?: HomeExperienceService | null;
  readonly coachTimeline?: CoachTimelineService | null;
  readonly planHistory?: PlanHistoryService | null;
  readonly proactiveInsights?: ProactiveInsightsService | null;
  readonly explainableCoachingSession?: ExplainableCoachingSessionService | null;
  readonly clock?: () => string;
  readonly service?: WeeklyCoachReportService;
}

export const WeeklyCoachReportFactory = {
  create(deps: WeeklyCoachReportFactoryDeps = {}): WeeklyCoachReportService {
    return (
      deps.service ??
      createWeeklyCoachReportService({
        dailyBrief: deps.dailyBrief ?? null,
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

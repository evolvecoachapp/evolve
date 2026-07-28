import {
  createAthleteWorkspaceService,
  type AthleteWorkspaceService,
} from "../../../features/intelligence-workspace/services/AthleteWorkspaceService";
import type { AthleteStateService } from "../../../features/athlete-state/services/AthleteStateService";
import type { CoachTimelineService } from "../../../features/coach-timeline/services/CoachTimelineService";
import type { ExplainableCoachingSessionService } from "../../../features/coaching-session/composition/services/ExplainableCoachingSessionService";
import type { DailyBriefService } from "../../../features/daily-brief/services/DailyBriefService";
import type { HomeExperienceService } from "../../../features/home-experience/services/HomeExperienceService";
import type { PlanHistoryService } from "../../../features/plan-history/services/PlanHistoryService";
import type { PlanRestoreService } from "../../../features/plan-restore/services/PlanRestoreService";
import type { ProactiveInsightsService } from "../../../features/proactive-insights/services/ProactiveInsightsService";
import type { WeeklyCoachReportService } from "../../../features/weekly-report/services/WeeklyCoachReportService";

export interface AthleteWorkspaceFactoryDeps {
  readonly athleteState?: AthleteStateService | null;
  readonly homeExperience?: HomeExperienceService | null;
  readonly dailyBrief?: DailyBriefService | null;
  readonly weeklyCoachReport?: WeeklyCoachReportService | null;
  readonly coachTimeline?: CoachTimelineService | null;
  readonly planHistory?: PlanHistoryService | null;
  readonly planRestore?: PlanRestoreService | null;
  readonly proactiveInsights?: ProactiveInsightsService | null;
  readonly explainableCoachingSession?: ExplainableCoachingSessionService | null;
  readonly clock?: () => string;
  readonly version?: string;
  readonly service?: AthleteWorkspaceService;
}

export const AthleteWorkspaceFactory = {
  create(deps: AthleteWorkspaceFactoryDeps = {}): AthleteWorkspaceService {
    return (
      deps.service ??
      createAthleteWorkspaceService({
        athleteState: deps.athleteState ?? null,
        homeExperience: deps.homeExperience ?? null,
        dailyBrief: deps.dailyBrief ?? null,
        weeklyCoachReport: deps.weeklyCoachReport ?? null,
        coachTimeline: deps.coachTimeline ?? null,
        planHistory: deps.planHistory ?? null,
        planRestore: deps.planRestore ?? null,
        proactiveInsights: deps.proactiveInsights ?? null,
        explainableCoachingSession: deps.explainableCoachingSession ?? null,
        clock: deps.clock,
        version: deps.version,
      })
    );
  },
} as const;

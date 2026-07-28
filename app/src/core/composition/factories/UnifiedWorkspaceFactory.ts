import {
  createAthleteSnapshotService,
  type AthleteSnapshotService,
  type AthleteSnapshotServiceDeps,
} from "../../../features/athlete-snapshot/services/AthleteSnapshotService";
import type { AthleteStateService } from "../../../features/athlete-state/services/AthleteStateService";
import type { CoachTimelineService } from "../../../features/coach-timeline/services/CoachTimelineService";
import type { ExplainableCoachingSessionService } from "../../../features/coaching-session/composition/services/ExplainableCoachingSessionService";
import type { DailyBriefService } from "../../../features/daily-brief/services/DailyBriefService";
import type { HomeExperienceService } from "../../../features/home-experience/services/HomeExperienceService";
import type { ProactiveInsightsService } from "../../../features/proactive-insights/services/ProactiveInsightsService";
import type { WeeklyCoachReportService } from "../../../features/weekly-report/services/WeeklyCoachReportService";
import {
  createUnifiedWorkspaceService,
  type UnifiedWorkspaceService,
} from "../../../features/unified-workspace/services/UnifiedWorkspaceService";

export interface UnifiedWorkspaceFactoryDeps {
  readonly athleteState?: AthleteStateService | null;
  readonly homeExperience?: HomeExperienceService | null;
  readonly dailyBrief?: DailyBriefService | null;
  readonly weeklyCoachReport?: WeeklyCoachReportService | null;
  readonly coachTimeline?: CoachTimelineService | null;
  readonly proactiveInsights?: ProactiveInsightsService | null;
  readonly explainableCoachingSession?: ExplainableCoachingSessionService | null;
  readonly athleteSnapshot?: AthleteSnapshotService | null;
  readonly athleteSnapshotDeps?: AthleteSnapshotServiceDeps;
  readonly clock?: () => string;
  readonly version?: string;
  readonly schemaVersion?: string;
  readonly service?: UnifiedWorkspaceService;
}

export const UnifiedWorkspaceFactory = {
  create(deps: UnifiedWorkspaceFactoryDeps = {}): UnifiedWorkspaceService {
    return (
      deps.service ??
      createUnifiedWorkspaceService({
        athleteState: deps.athleteState ?? null,
        homeExperience: deps.homeExperience ?? null,
        dailyBrief: deps.dailyBrief ?? null,
        weeklyCoachReport: deps.weeklyCoachReport ?? null,
        coachTimeline: deps.coachTimeline ?? null,
        proactiveInsights: deps.proactiveInsights ?? null,
        explainableCoachingSession: deps.explainableCoachingSession ?? null,
        athleteSnapshot:
          deps.athleteSnapshot ??
          (deps.athleteSnapshotDeps
            ? createAthleteSnapshotService(deps.athleteSnapshotDeps)
            : null),
        clock: deps.clock,
        version: deps.version,
        schemaVersion: deps.schemaVersion,
      })
    );
  },
} as const;

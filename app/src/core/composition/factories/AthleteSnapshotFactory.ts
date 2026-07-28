import {
  createAthleteSnapshotService,
  type AthleteSnapshotService,
} from "../../../features/athlete-snapshot/services/AthleteSnapshotService";
import type { AthleteStateService } from "../../../features/athlete-state/services/AthleteStateService";
import type { CoachTimelineService } from "../../../features/coach-timeline/services/CoachTimelineService";
import type { ExplainableCoachingSessionService } from "../../../features/coaching-session/composition/services/ExplainableCoachingSessionService";
import type { AthleteWorkspaceService } from "../../../features/intelligence-workspace/services/AthleteWorkspaceService";
import type { WeeklyCoachReportService } from "../../../features/weekly-report/services/WeeklyCoachReportService";

export interface AthleteSnapshotFactoryDeps {
  readonly athleteState?: AthleteStateService | null;
  readonly athleteWorkspace?: AthleteWorkspaceService | null;
  readonly coachTimeline?: CoachTimelineService | null;
  readonly explainableCoachingSession?: ExplainableCoachingSessionService | null;
  readonly weeklyCoachReport?: WeeklyCoachReportService | null;
  readonly clock?: () => string;
  readonly applicationVersion?: string;
  readonly schemaVersion?: string;
  readonly snapshotVersion?: string;
  readonly service?: AthleteSnapshotService;
}

export const AthleteSnapshotFactory = {
  create(deps: AthleteSnapshotFactoryDeps = {}): AthleteSnapshotService {
    return (
      deps.service ??
      createAthleteSnapshotService({
        athleteState: deps.athleteState ?? null,
        athleteWorkspace: deps.athleteWorkspace ?? null,
        coachTimeline: deps.coachTimeline ?? null,
        explainableCoachingSession: deps.explainableCoachingSession ?? null,
        weeklyCoachReport: deps.weeklyCoachReport ?? null,
        clock: deps.clock,
        applicationVersion: deps.applicationVersion,
        schemaVersion: deps.schemaVersion,
        snapshotVersion: deps.snapshotVersion,
      })
    );
  },
} as const;

import type { AthleteSnapshot } from "../../athlete-snapshot/models/AthleteSnapshot";
import type { AthleteSnapshotService } from "../../athlete-snapshot/services/AthleteSnapshotService";
import type { AthleteStateService } from "../../athlete-state/services/AthleteStateService";
import { CoachTimelineEventCategories } from "../../coach-timeline/models/CoachTimelineEvent";
import type { CoachTimeline } from "../../coach-timeline/models/CoachTimeline";
import type { CoachTimelineEntry } from "../../coach-timeline/models/CoachTimelineEntry";
import type { CoachTimelineService } from "../../coach-timeline/services/CoachTimelineService";
import type { ExplainableCoachingSessionService } from "../../coaching-session/composition/services/ExplainableCoachingSessionService";
import type { DailyBrief } from "../../daily-brief/models/DailyBrief";
import type { DailyBriefService } from "../../daily-brief/services/DailyBriefService";
import type { GoalProgress } from "../../goal-progress/models/GoalProgress";
import type { GoalRuntimePersistenceState } from "../../../runtime/domain-persistence/models/GoalRuntimePersistenceState";
import type { CoachRuntimePersistenceState } from "../../../runtime/domain-persistence/models/CoachRuntimePersistenceState";
import type { NotificationRuntimePersistenceState } from "../../../runtime/domain-persistence/models/NotificationRuntimePersistenceState";
import type { HomeExperience } from "../../home-experience/models/HomeExperience";
import type { HomeExperienceService } from "../../home-experience/services/HomeExperienceService";
import type { CoachInsight } from "../../proactive-insights/models/CoachInsight";
import type { ProactiveInsightsService } from "../../proactive-insights/services/ProactiveInsightsService";
import type { WeeklyCoachReport } from "../../weekly-report/models/WeeklyCoachReport";
import type { WeeklyCoachReportService } from "../../weekly-report/services/WeeklyCoachReportService";
import type { Workspace } from "../models/Workspace";
import type { WorkspaceCoach } from "../models/WorkspaceCoach";
import type { WorkspaceHealth } from "../models/WorkspaceHealth";
import type { WorkspaceInsights } from "../models/WorkspaceInsights";
import type { WorkspaceResult } from "../models/WorkspaceResult";
import type { WorkspaceSummary } from "../models/WorkspaceSummary";
import {
  buildUnifiedWorkspace,
  type BuildUnifiedWorkspaceInput,
} from "./buildUnifiedWorkspace";
import { validateWorkspace } from "./validateWorkspace";

export interface UnifiedWorkspaceServiceDeps {
  readonly athleteState?: AthleteStateService | null;
  readonly homeExperience?: HomeExperienceService | null;
  readonly dailyBrief?: DailyBriefService | null;
  readonly weeklyCoachReport?: WeeklyCoachReportService | null;
  readonly coachTimeline?: CoachTimelineService | null;
  readonly proactiveInsights?: ProactiveInsightsService | null;
  readonly explainableCoachingSession?: ExplainableCoachingSessionService | null;
  readonly athleteSnapshot?: AthleteSnapshotService | null;
  readonly clock?: () => string;
  readonly version?: string;
  readonly schemaVersion?: string;
}

type WorkspaceBuildInput = Omit<
  BuildUnifiedWorkspaceInput,
  | "generatedAt"
  | "version"
  | "schemaVersion"
  | "homeExperience"
  | "dailyBrief"
  | "weeklyReport"
  | "timeline"
  | "latestEvents"
  | "latestDecisions"
  | "latestRestores"
  | "insights"
  | "criticalFindings"
  | "coachingSession"
  | "snapshot"
> & {
  readonly generatedAt?: string;
  readonly homeExperience?: HomeExperience | null;
  readonly dailyBrief?: DailyBrief | null;
  readonly weeklyReport?: WeeklyCoachReport | null;
  readonly timeline?: CoachTimeline | null;
  readonly latestEvents?: readonly CoachTimelineEntry[];
  readonly latestDecisions?: readonly CoachTimelineEntry[];
  readonly latestRestores?: readonly CoachTimelineEntry[];
  readonly insights?: readonly CoachInsight[];
  readonly criticalFindings?: readonly CoachInsight[];
  readonly coachingSession?: import("../../coaching-session/composition/models/CoachingSession").CoachingSession | null;
  readonly snapshot?: AthleteSnapshot | null;
  readonly goalRuntimeOverlay?: GoalRuntimePersistenceState | null;
  readonly coachRuntimeOverlay?: CoachRuntimePersistenceState | null;
  readonly notificationRuntimeOverlay?: NotificationRuntimePersistenceState | null;
};

/**
 * Unified Athlete Workspace composition facade (Sprint 28.3).
 * Compose only — caches latest workspace by athlete in memory.
 */
export class UnifiedWorkspaceService {
  private readonly athleteState: AthleteStateService | null;
  private readonly homeExperience: HomeExperienceService | null;
  private readonly dailyBrief: DailyBriefService | null;
  private readonly weeklyCoachReport: WeeklyCoachReportService | null;
  private readonly coachTimeline: CoachTimelineService | null;
  private readonly proactiveInsights: ProactiveInsightsService | null;
  private readonly explainableCoachingSession: ExplainableCoachingSessionService | null;
  private readonly athleteSnapshot: AthleteSnapshotService | null;
  private readonly clock: () => string;
  private readonly version: string;
  private readonly schemaVersion: string;
  private readonly latestByAthlete = new Map<string, Workspace>();

  constructor(deps: UnifiedWorkspaceServiceDeps = {}) {
    this.athleteState = deps.athleteState ?? null;
    this.homeExperience = deps.homeExperience ?? null;
    this.dailyBrief = deps.dailyBrief ?? null;
    this.weeklyCoachReport = deps.weeklyCoachReport ?? null;
    this.coachTimeline = deps.coachTimeline ?? null;
    this.proactiveInsights = deps.proactiveInsights ?? null;
    this.explainableCoachingSession = deps.explainableCoachingSession ?? null;
    this.athleteSnapshot = deps.athleteSnapshot ?? null;
    this.clock = deps.clock ?? (() => new Date().toISOString());
    this.version = deps.version ?? "28.3";
    this.schemaVersion = deps.schemaVersion ?? "1.0";
  }

  build(input: WorkspaceBuildInput): WorkspaceResult {
    const generatedAt = input.generatedAt ?? this.clock();
    const current = this.latestByAthlete.get(input.athleteId) ?? null;
    const timeline =
      input.timeline ??
      this.coachTimeline?.getTimeline(input.athleteId) ??
      null;
    const insights =
      input.insights ??
      this.proactiveInsights?.analyze({ athleteId: input.athleteId }).insights ??
      Object.freeze([]);
    const result = buildUnifiedWorkspace({
      ...input,
      generatedAt,
      version: this.version,
      schemaVersion: this.schemaVersion,
      homeExperience:
        input.homeExperience ??
        this.homeExperience?.getHomeExperience(input.athleteId) ??
        null,
      dailyBrief:
        input.dailyBrief ??
        this.dailyBrief?.getDailyBrief(input.athleteId) ??
        null,
      weeklyReport:
        input.weeklyReport ??
        this.weeklyCoachReport?.getWeeklyCoachReport(input.athleteId) ??
        null,
      timeline,
      latestEvents:
        input.latestEvents ??
        Object.freeze((timeline?.entries ?? []).slice(-10).reverse()),
      latestDecisions:
        input.latestDecisions ?? this.filterTimelineEntries(timeline, 10),
      latestRestores:
        input.latestRestores ?? this.filterRestoreEntries(timeline, 10),
      insights,
      criticalFindings:
        input.criticalFindings ??
        this.proactiveInsights?.getCriticalInsights(input.athleteId) ??
        Object.freeze([]),
      coachingSession:
        input.coachingSession ??
        this.explainableCoachingSession?.getLatest(input.athleteId) ??
        null,
      snapshot:
        input.snapshot ??
        this.athleteSnapshot?.getCurrentSnapshot(input.athleteId) ??
        null,
      goalProgress: input.goalProgress ?? null,
      goalRuntimeOverlay:
        input.goalRuntimeOverlay ?? current?.goalRuntimeOverlay ?? null,
      coachRuntimeOverlay:
        input.coachRuntimeOverlay ?? current?.coachRuntimeOverlay ?? null,
      notificationRuntimeOverlay:
        input.notificationRuntimeOverlay ??
        current?.notificationRuntimeOverlay ??
        null,
    });

    if (result.success && result.workspace) {
      this.latestByAthlete.set(input.athleteId, result.workspace);
    }

    return result;
  }

  getWorkspace(athleteId: string): Workspace | null {
    return this.latestByAthlete.get(athleteId) ?? null;
  }

  restorePersisted(workspace: Workspace): void {
    this.latestByAthlete.set(workspace.athleteId, workspace);
  }

  getWorkspaceSummary(athleteId: string): WorkspaceSummary | null {
    return this.getWorkspace(athleteId)?.summary ?? null;
  }

  getWorkspaceHealth(athleteId: string): WorkspaceHealth | null {
    return this.getWorkspace(athleteId)?.health ?? null;
  }

  getWorkspaceInsights(athleteId: string): WorkspaceInsights | null {
    return this.getWorkspace(athleteId)?.insights ?? null;
  }

  getWorkspaceCoach(athleteId: string): WorkspaceCoach | null {
    return this.getWorkspace(athleteId)?.coach ?? null;
  }

  validate(athleteId: string) {
    return validateWorkspace(this.getWorkspace(athleteId));
  }

  getAthleteState(): AthleteStateService | null {
    return this.athleteState;
  }

  getHomeExperience(): HomeExperienceService | null {
    return this.homeExperience;
  }

  getDailyBrief(): DailyBriefService | null {
    return this.dailyBrief;
  }

  getWeeklyCoachReport(): WeeklyCoachReportService | null {
    return this.weeklyCoachReport;
  }

  getCoachTimeline(): CoachTimelineService | null {
    return this.coachTimeline;
  }

  getProactiveInsights(): ProactiveInsightsService | null {
    return this.proactiveInsights;
  }

  getExplainableCoachingSession(): ExplainableCoachingSessionService | null {
    return this.explainableCoachingSession;
  }

  getAthleteSnapshot(): AthleteSnapshotService | null {
    return this.athleteSnapshot;
  }

  private filterTimelineEntries(
    timeline: CoachTimeline | null,
    limit: number,
  ): readonly CoachTimelineEntry[] {
    return Object.freeze(
      (timeline?.entries ?? [])
        .filter((entry) => entry.affectedDomain === "decision")
        .slice(-limit)
        .reverse(),
    );
  }

  private filterRestoreEntries(
    timeline: CoachTimeline | null,
    limit: number,
  ): readonly CoachTimelineEntry[] {
    return Object.freeze(
      (timeline?.entries ?? [])
        .filter((entry) => {
          const category = entry.event.category;
          return (
            category === CoachTimelineEventCategories.WORKOUT_RESTORED ||
            category === CoachTimelineEventCategories.NUTRITION_RESTORED
          );
        })
        .slice(-limit)
        .reverse(),
    );
  }
}

export function createUnifiedWorkspaceService(
  deps: UnifiedWorkspaceServiceDeps = {},
): UnifiedWorkspaceService {
  return new UnifiedWorkspaceService(deps);
}

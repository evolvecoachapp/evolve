import type { AthleteStateService } from "../../athlete-state/services/AthleteStateService";
import type { CoachTimeline } from "../../coach-timeline/models/CoachTimeline";
import type { CoachTimelineEntry } from "../../coach-timeline/models/CoachTimelineEntry";
import { CoachTimelineEventCategories } from "../../coach-timeline/models/CoachTimelineEvent";
import type { CoachTimelineService } from "../../coach-timeline/services/CoachTimelineService";
import type { ExplainableCoachingSessionService } from "../../coaching-session/composition/services/ExplainableCoachingSessionService";
import type { DailyBrief } from "../../daily-brief/models/DailyBrief";
import type { DailyBriefService } from "../../daily-brief/services/DailyBriefService";
import type { GoalProgress } from "../../goal-progress/models/GoalProgress";
import type { HomeExperience } from "../../home-experience/models/HomeExperience";
import type { HomeExperienceService } from "../../home-experience/services/HomeExperienceService";
import type { PlanHistory } from "../../plan-history/models/PlanHistory";
import type { PlanHistoryService } from "../../plan-history/services/PlanHistoryService";
import type { PlanRestoreService } from "../../plan-restore/services/PlanRestoreService";
import type { CoachInsight } from "../../proactive-insights/models/CoachInsight";
import type { ProactiveInsightsService } from "../../proactive-insights/services/ProactiveInsightsService";
import type { WeeklyCoachReport } from "../../weekly-report/models/WeeklyCoachReport";
import type { AthleteWorkspace } from "../models/AthleteWorkspace";
import type { WorkspaceCoach } from "../models/WorkspaceCoach";
import type { WorkspaceInsights } from "../models/WorkspaceInsights";
import type { WorkspaceOverview } from "../models/WorkspaceOverview";
import type { WorkspaceResult } from "../models/WorkspaceResult";
import type { WorkspaceStatus } from "../models/WorkspaceStatus";
import type { WorkspaceTimeline } from "../models/WorkspaceTimeline";
import {
  buildAthleteWorkspace,
  type BuildAthleteWorkspaceInput,
} from "./buildAthleteWorkspace";
import { validateWorkspace } from "./validateWorkspace";
import type { WorkspaceMetadata } from "../models/WorkspaceMetadata";

export interface AthleteWorkspaceServiceDeps {
  readonly athleteState?: AthleteStateService | null;
  readonly homeExperience?: HomeExperienceService | null;
  readonly dailyBrief?: DailyBriefService | null;
  readonly weeklyCoachReport?: import("../../weekly-report/services/WeeklyCoachReportService").WeeklyCoachReportService | null;
  readonly coachTimeline?: CoachTimelineService | null;
  readonly planHistory?: PlanHistoryService | null;
  readonly planRestore?: PlanRestoreService | null;
  readonly proactiveInsights?: ProactiveInsightsService | null;
  readonly explainableCoachingSession?: ExplainableCoachingSessionService | null;
  readonly clock?: () => string;
  readonly version?: string;
}

type WorkspaceBuildInput = Omit<
  BuildAthleteWorkspaceInput,
  | "generatedAt"
  | "homeExperience"
  | "dailyBrief"
  | "weeklyReport"
  | "timeline"
  | "latestDecisions"
  | "latestRestores"
  | "planHistory"
  | "insights"
  | "criticalFindings"
  | "coachingSession"
  | "version"
> & {
  readonly generatedAt?: string;
  readonly homeExperience?: HomeExperience | null;
  readonly dailyBrief?: DailyBrief | null;
  readonly weeklyReport?: WeeklyCoachReport | null;
  readonly timeline?: CoachTimeline | null;
  readonly latestDecisions?: readonly CoachTimelineEntry[];
  readonly latestRestores?: readonly CoachTimelineEntry[];
  readonly planHistory?: PlanHistory | null;
  readonly insights?: readonly CoachInsight[];
  readonly criticalFindings?: readonly CoachInsight[];
  readonly coachingSession?: import("../../coaching-session/composition/models/CoachingSession").CoachingSession | null;
};

/**
 * Athlete Intelligence Workspace composition facade (Sprint 28.1).
 * Compose only — caches latest workspace by athlete in memory.
 */
export class AthleteWorkspaceService {
  private readonly athleteState: AthleteStateService | null;
  private readonly homeExperience: HomeExperienceService | null;
  private readonly dailyBrief: DailyBriefService | null;
  private readonly weeklyCoachReport: import("../../weekly-report/services/WeeklyCoachReportService").WeeklyCoachReportService | null;
  private readonly coachTimeline: CoachTimelineService | null;
  private readonly planHistory: PlanHistoryService | null;
  private readonly planRestore: PlanRestoreService | null;
  private readonly proactiveInsights: ProactiveInsightsService | null;
  private readonly explainableCoachingSession: ExplainableCoachingSessionService | null;
  private readonly clock: () => string;
  private readonly version: string;
  private readonly latestByAthlete = new Map<string, AthleteWorkspace>();

  constructor(deps: AthleteWorkspaceServiceDeps = {}) {
    this.athleteState = deps.athleteState ?? null;
    this.homeExperience = deps.homeExperience ?? null;
    this.dailyBrief = deps.dailyBrief ?? null;
    this.weeklyCoachReport = deps.weeklyCoachReport ?? null;
    this.coachTimeline = deps.coachTimeline ?? null;
    this.planHistory = deps.planHistory ?? null;
    this.planRestore = deps.planRestore ?? null;
    this.proactiveInsights = deps.proactiveInsights ?? null;
    this.explainableCoachingSession = deps.explainableCoachingSession ?? null;
    this.clock = deps.clock ?? (() => new Date().toISOString());
    this.version = deps.version ?? "28.1";
  }

  build(input: WorkspaceBuildInput): WorkspaceResult {
    const generatedAt = input.generatedAt ?? this.clock();
    const timeline =
      input.timeline ??
      this.coachTimeline?.getTimeline(input.athleteId) ??
      null;
    const insights =
      input.insights ??
      this.proactiveInsights?.analyze({ athleteId: input.athleteId }).insights ??
      Object.freeze([]);
    const latestDecisions =
      input.latestDecisions ?? this.filterTimelineEntries(timeline, "decision", 10);
    const latestRestores =
      input.latestRestores ?? this.filterRestoreEntries(timeline, 10);
    const coachingSession =
      input.coachingSession ??
      this.explainableCoachingSession?.getLatest(input.athleteId) ??
      null;
    const result = buildAthleteWorkspace({
      ...input,
      generatedAt,
      version: this.version,
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
      latestDecisions,
      latestRestores,
      planHistory: input.planHistory ?? null,
      insights,
      criticalFindings:
        input.criticalFindings ??
        this.proactiveInsights?.getCriticalInsights(input.athleteId) ??
        Object.freeze([]),
      coachingSession,
    });

    if (result.success && result.workspace) {
      this.latestByAthlete.set(input.athleteId, result.workspace);
    }

    return result;
  }

  getAthleteWorkspace(athleteId: string): AthleteWorkspace | null {
    return this.latestByAthlete.get(athleteId) ?? null;
  }

  getWorkspaceOverview(athleteId: string): WorkspaceOverview | null {
    return this.getAthleteWorkspace(athleteId)?.overview ?? null;
  }

  getWorkspaceStatus(athleteId: string): WorkspaceStatus | null {
    return this.getAthleteWorkspace(athleteId)?.status ?? null;
  }

  getWorkspaceTimeline(athleteId: string): WorkspaceTimeline | null {
    return this.getAthleteWorkspace(athleteId)?.timeline ?? null;
  }

  getWorkspaceInsights(athleteId: string): WorkspaceInsights | null {
    return this.getAthleteWorkspace(athleteId)?.insights ?? null;
  }

  getWorkspaceCoach(athleteId: string): WorkspaceCoach | null {
    return this.getAthleteWorkspace(athleteId)?.coach ?? null;
  }

  getWorkspaceMetadata(athleteId: string): WorkspaceMetadata | null {
    return this.getAthleteWorkspace(athleteId)?.metadata ?? null;
  }

  validate(athleteId: string) {
    return validateWorkspace(this.getAthleteWorkspace(athleteId));
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

  getWeeklyCoachReport() {
    return this.weeklyCoachReport;
  }

  getCoachTimeline(): CoachTimelineService | null {
    return this.coachTimeline;
  }

  getPlanHistory(): PlanHistoryService | null {
    return this.planHistory;
  }

  getPlanRestore(): PlanRestoreService | null {
    return this.planRestore;
  }

  getProactiveInsights(): ProactiveInsightsService | null {
    return this.proactiveInsights;
  }

  getExplainableCoachingSession(): ExplainableCoachingSessionService | null {
    return this.explainableCoachingSession;
  }

  private filterTimelineEntries(
    timeline: CoachTimeline | null,
    domain: "decision",
    limit: number,
  ): readonly CoachTimelineEntry[] {
    return Object.freeze(
      (timeline?.entries ?? [])
        .filter((entry) => entry.affectedDomain === domain)
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

export function createAthleteWorkspaceService(
  deps: AthleteWorkspaceServiceDeps = {},
): AthleteWorkspaceService {
  return new AthleteWorkspaceService(deps);
}

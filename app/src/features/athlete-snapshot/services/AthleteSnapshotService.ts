import type { AthleteStateService } from "../../athlete-state/services/AthleteStateService";
import { CoachTimelineEventCategories } from "../../coach-timeline/models/CoachTimelineEvent";
import type { CoachTimeline } from "../../coach-timeline/models/CoachTimeline";
import type { CoachTimelineEntry } from "../../coach-timeline/models/CoachTimelineEntry";
import type { CoachTimelineService } from "../../coach-timeline/services/CoachTimelineService";
import type { ExplainableCoachingSessionService } from "../../coaching-session/composition/services/ExplainableCoachingSessionService";
import type { GoalProgress } from "../../goal-progress/models/GoalProgress";
import type { AthleteWorkspace } from "../../intelligence-workspace/models/AthleteWorkspace";
import type { AthleteWorkspaceService } from "../../intelligence-workspace/services/AthleteWorkspaceService";
import type { WeeklyCoachReportService } from "../../weekly-report/services/WeeklyCoachReportService";
import type { AthleteSnapshot } from "../models/AthleteSnapshot";
import type { SnapshotCoach } from "../models/SnapshotCoach";
import type { SnapshotIdentity } from "../models/SnapshotIdentity";
import type { SnapshotIntegrity } from "../models/SnapshotIntegrity";
import type { SnapshotResult } from "../models/SnapshotResult";
import type { SnapshotState } from "../models/SnapshotState";
import type { SnapshotTimeline } from "../models/SnapshotTimeline";
import type { SnapshotWorkspace } from "../models/SnapshotWorkspace";
import {
  buildAthleteSnapshot,
  type BuildAthleteSnapshotInput,
} from "./buildAthleteSnapshot";
import { validateSnapshot } from "./validateSnapshot";

export interface AthleteSnapshotServiceDeps {
  readonly athleteState?: AthleteStateService | null;
  readonly athleteWorkspace?: AthleteWorkspaceService | null;
  readonly coachTimeline?: CoachTimelineService | null;
  readonly explainableCoachingSession?: ExplainableCoachingSessionService | null;
  readonly weeklyCoachReport?: WeeklyCoachReportService | null;
  readonly clock?: () => string;
  readonly applicationVersion?: string;
  readonly schemaVersion?: string;
  readonly snapshotVersion?: string;
}

type SnapshotBuildInput = Omit<
  BuildAthleteSnapshotInput,
  | "createdAt"
  | "workspace"
  | "timeline"
  | "latestEvents"
  | "latestDecisions"
  | "latestRestores"
  | "coachingSession"
  | "weeklyReport"
  | "applicationVersion"
  | "schemaVersion"
  | "snapshotVersion"
> & {
  readonly createdAt?: string;
  readonly workspace?: AthleteWorkspace | null;
  readonly timeline?: CoachTimeline | null;
  readonly latestEvents?: readonly CoachTimelineEntry[];
  readonly latestDecisions?: readonly CoachTimelineEntry[];
  readonly latestRestores?: readonly CoachTimelineEntry[];
  readonly coachingSession?: import("../../coaching-session/composition/models/CoachingSession").CoachingSession | null;
  readonly weeklyReport?: import("../../weekly-report/models/WeeklyCoachReport").WeeklyCoachReport | null;
};

/**
 * Composition facade for immutable athlete snapshots.
 */
export class AthleteSnapshotService {
  private readonly athleteState: AthleteStateService | null;
  private readonly athleteWorkspace: AthleteWorkspaceService | null;
  private readonly coachTimeline: CoachTimelineService | null;
  private readonly explainableCoachingSession: ExplainableCoachingSessionService | null;
  private readonly weeklyCoachReport: WeeklyCoachReportService | null;
  private readonly clock: () => string;
  private readonly applicationVersion: string;
  private readonly schemaVersion: string;
  private readonly snapshotVersion: string;
  private readonly latestByAthlete = new Map<string, AthleteSnapshot>();

  constructor(deps: AthleteSnapshotServiceDeps = {}) {
    this.athleteState = deps.athleteState ?? null;
    this.athleteWorkspace = deps.athleteWorkspace ?? null;
    this.coachTimeline = deps.coachTimeline ?? null;
    this.explainableCoachingSession = deps.explainableCoachingSession ?? null;
    this.weeklyCoachReport = deps.weeklyCoachReport ?? null;
    this.clock = deps.clock ?? (() => new Date().toISOString());
    this.applicationVersion = deps.applicationVersion ?? "28.2";
    this.schemaVersion = deps.schemaVersion ?? "1.0";
    this.snapshotVersion = deps.snapshotVersion ?? "28.2";
  }

  build(input: SnapshotBuildInput): SnapshotResult {
    const createdAt = input.createdAt ?? this.clock();
    const timeline =
      input.timeline ??
      this.coachTimeline?.getTimeline(input.athleteId) ??
      null;
    const latestEvents =
      input.latestEvents ?? Object.freeze((timeline?.entries ?? []).slice(-10).reverse());
    const latestDecisions =
      input.latestDecisions ?? this.filterTimelineEntries(timeline, "decision", 10);
    const latestRestores =
      input.latestRestores ?? this.filterRestoreEntries(timeline, 10);
    const result = buildAthleteSnapshot({
      ...input,
      createdAt,
      athleteState: input.athleteState ?? null,
      workspace:
        input.workspace ??
        this.athleteWorkspace?.getAthleteWorkspace(input.athleteId) ??
        null,
      timeline,
      latestEvents,
      latestDecisions,
      latestRestores,
      coachingSession:
        input.coachingSession ??
        this.explainableCoachingSession?.getLatest(input.athleteId) ??
        null,
      weeklyReport:
        input.weeklyReport ??
        this.weeklyCoachReport?.getWeeklyCoachReport(input.athleteId) ??
        null,
      applicationVersion: this.applicationVersion,
      schemaVersion: this.schemaVersion,
      snapshotVersion: this.snapshotVersion,
    });

    if (result.success && result.snapshot) {
      this.latestByAthlete.set(input.athleteId, result.snapshot);
    }

    return result;
  }

  getCurrentSnapshot(athleteId: string): AthleteSnapshot | null {
    return this.latestByAthlete.get(athleteId) ?? null;
  }

  restorePersisted(snapshot: AthleteSnapshot): void {
    this.latestByAthlete.set(snapshot.athleteId, snapshot);
  }

  getSnapshotIdentity(athleteId: string): SnapshotIdentity | null {
    return this.getCurrentSnapshot(athleteId)?.identity ?? null;
  }

  getSnapshotState(athleteId: string): SnapshotState | null {
    return this.getCurrentSnapshot(athleteId)?.state ?? null;
  }

  getSnapshotWorkspace(athleteId: string): SnapshotWorkspace | null {
    return this.getCurrentSnapshot(athleteId)?.workspace ?? null;
  }

  getSnapshotTimeline(athleteId: string): SnapshotTimeline | null {
    return this.getCurrentSnapshot(athleteId)?.timeline ?? null;
  }

  getSnapshotCoach(athleteId: string): SnapshotCoach | null {
    return this.getCurrentSnapshot(athleteId)?.coach ?? null;
  }

  validate(athleteId: string): SnapshotIntegrity {
    return validateSnapshot(this.getCurrentSnapshot(athleteId));
  }

  getAthleteState(): AthleteStateService | null {
    return this.athleteState;
  }

  getAthleteWorkspace(): AthleteWorkspaceService | null {
    return this.athleteWorkspace;
  }

  getCoachTimeline(): CoachTimelineService | null {
    return this.coachTimeline;
  }

  getExplainableCoachingSession(): ExplainableCoachingSessionService | null {
    return this.explainableCoachingSession;
  }

  getWeeklyCoachReport(): WeeklyCoachReportService | null {
    return this.weeklyCoachReport;
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

export function createAthleteSnapshotService(
  deps: AthleteSnapshotServiceDeps = {},
): AthleteSnapshotService {
  return new AthleteSnapshotService(deps);
}

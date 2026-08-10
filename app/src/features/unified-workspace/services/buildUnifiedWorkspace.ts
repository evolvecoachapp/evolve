import type { AthleteSnapshot } from "../../athlete-snapshot/models/AthleteSnapshot";
import type { AthleteState } from "../../athlete-state/models/AthleteState";
import type { CoachTimeline } from "../../coach-timeline/models/CoachTimeline";
import type { CoachTimelineEntry } from "../../coach-timeline/models/CoachTimelineEntry";
import type { CoachingSession } from "../../coaching-session/composition/models/CoachingSession";
import type { DailyBrief } from "../../daily-brief/models/DailyBrief";
import type { GoalProgress } from "../../goal-progress/models/GoalProgress";
import type { GoalRuntimePersistenceState } from "../../../runtime/domain-persistence/models/GoalRuntimePersistenceState";
import type { HomeExperience } from "../../home-experience/models/HomeExperience";
import type { CoachInsight } from "../../proactive-insights/models/CoachInsight";
import type { WeeklyCoachReport } from "../../weekly-report/models/WeeklyCoachReport";
import type { Workspace } from "../models/Workspace";
import type { WorkspaceResult } from "../models/WorkspaceResult";
import { buildWorkspaceCoach } from "./buildWorkspaceCoach";
import { buildWorkspaceGoals } from "./buildWorkspaceGoals";
import { buildWorkspaceHeader } from "./buildWorkspaceHeader";
import { buildWorkspaceHealth } from "./buildWorkspaceHealth";
import { buildWorkspaceInsights } from "./buildWorkspaceInsights";
import { buildWorkspaceMetadata } from "./buildWorkspaceMetadata";
import { buildWorkspaceNutrition } from "./buildWorkspaceNutrition";
import { buildWorkspaceRecovery } from "./buildWorkspaceRecovery";
import { buildWorkspaceSnapshot } from "./buildWorkspaceSnapshot";
import { buildWorkspaceSummary } from "./buildWorkspaceSummary";
import { buildWorkspaceTimeline } from "./buildWorkspaceTimeline";
import { buildWorkspaceWorkout } from "./buildWorkspaceWorkout";
import { validateWorkspace } from "./validateWorkspace";

export interface BuildUnifiedWorkspaceInput {
  readonly athleteId: string;
  readonly requestId: string;
  readonly generatedAt: string;
  readonly version?: string;
  readonly schemaVersion?: string;
  readonly athleteState?: AthleteState | null;
  readonly homeExperience?: HomeExperience | null;
  readonly dailyBrief?: DailyBrief | null;
  readonly weeklyReport?: WeeklyCoachReport | null;
  readonly timeline?: CoachTimeline | null;
  readonly latestEvents?: readonly CoachTimelineEntry[];
  readonly latestDecisions?: readonly CoachTimelineEntry[];
  readonly latestRestores?: readonly CoachTimelineEntry[];
  readonly insights?: readonly CoachInsight[];
  readonly criticalFindings?: readonly CoachInsight[];
  readonly coachingSession?: CoachingSession | null;
  readonly goalProgress?: GoalProgress | null;
  readonly goalRuntimeOverlay?: GoalRuntimePersistenceState | null;
  readonly snapshot?: AthleteSnapshot | null;
  readonly recoveryStatus?: string | null;
  readonly currentPhase?: string | null;
}

/**
 * Composes the complete immutable Unified Athlete Workspace.
 */
export function buildUnifiedWorkspace(
  input: BuildUnifiedWorkspaceInput,
): WorkspaceResult {
  const header = buildWorkspaceHeader({
    athleteId: input.athleteId,
    generatedAt: input.generatedAt,
    athleteState: input.athleteState ?? null,
    goalProgress: input.goalProgress ?? null,
    homeExperience: input.homeExperience ?? null,
    recoveryStatus: input.recoveryStatus,
    currentPhase: input.currentPhase,
  });
  const summary = buildWorkspaceSummary({
    athleteId: input.athleteId,
    generatedAt: input.generatedAt,
    homeExperience: input.homeExperience ?? null,
    dailyBrief: input.dailyBrief ?? null,
    weeklyReport: input.weeklyReport ?? null,
    snapshot: input.snapshot ?? null,
  });
  const health = buildWorkspaceHealth({
    athleteId: input.athleteId,
    athleteState: input.athleteState ?? null,
    homeExperience: input.homeExperience ?? null,
    recoveryStatus: input.recoveryStatus,
  });
  const goals = buildWorkspaceGoals({
    athleteId: input.athleteId,
    goalProgress: input.goalProgress ?? null,
    homeExperience: input.homeExperience ?? null,
  });
  const workout = buildWorkspaceWorkout({
    athleteId: input.athleteId,
    homeExperience: input.homeExperience ?? null,
  });
  const nutrition = buildWorkspaceNutrition({
    athleteId: input.athleteId,
    homeExperience: input.homeExperience ?? null,
  });
  const recovery = buildWorkspaceRecovery({
    athleteId: input.athleteId,
    athleteState: input.athleteState ?? null,
    homeExperience: input.homeExperience ?? null,
    recoveryStatus: input.recoveryStatus,
  });
  const insights = buildWorkspaceInsights({
    athleteId: input.athleteId,
    insights: input.insights ?? Object.freeze([]),
    criticalFindings: input.criticalFindings ?? Object.freeze([]),
    homeExperience: input.homeExperience ?? null,
  });
  const timeline = buildWorkspaceTimeline({
    athleteId: input.athleteId,
    timeline: input.timeline ?? null,
    latestEvents: input.latestEvents,
    latestDecisions: input.latestDecisions,
    latestRestores: input.latestRestores,
  });
  const coach = buildWorkspaceCoach({
    athleteId: input.athleteId,
    coachingSession: input.coachingSession ?? null,
  });
  const snapshot = buildWorkspaceSnapshot({
    athleteId: input.athleteId,
    snapshot: input.snapshot ?? null,
  });
  const metadata = buildWorkspaceMetadata({
    athleteId: input.athleteId,
    generatedAt: input.generatedAt,
    version: input.version,
    schemaVersion: input.schemaVersion,
    weeklyReport: input.weeklyReport ?? null,
  });

  const workspace: Workspace = Object.freeze({
    id: metadata.workspaceId,
    athleteId: input.athleteId,
    header,
    summary,
    health,
    goals,
    workout,
    nutrition,
    recovery,
    insights,
    timeline,
    coach,
    snapshot,
    metadata,
    goalRuntimeOverlay: input.goalRuntimeOverlay ?? null,
  });

  const validation = validateWorkspace(workspace);
  if (!validation.valid) {
    return Object.freeze({
      id: `unified-workspace-result:${input.requestId}:invalid`,
      success: false,
      workspace: null,
      summary: null,
      metadata: null,
      validation,
      message: `Unified athlete workspace validation failed: ${validation.errors.join("; ")}`,
      generatedAt: input.generatedAt,
    });
  }

  return Object.freeze({
    id: `unified-workspace-result:${input.requestId}`,
    success: true,
    workspace,
    summary,
    metadata,
    validation,
    message:
      "Unified athlete workspace composed deterministically from existing coaching artifacts.",
    generatedAt: input.generatedAt,
  });
}

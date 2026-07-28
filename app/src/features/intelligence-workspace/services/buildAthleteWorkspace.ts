import type { AthleteState } from "../../athlete-state/models/AthleteState";
import type { CoachTimeline } from "../../coach-timeline/models/CoachTimeline";
import type { CoachTimelineEntry } from "../../coach-timeline/models/CoachTimelineEntry";
import type { CoachingSession } from "../../coaching-session/composition/models/CoachingSession";
import type { DailyBrief } from "../../daily-brief/models/DailyBrief";
import type { GoalProgress } from "../../goal-progress/models/GoalProgress";
import type { HomeExperience } from "../../home-experience/models/HomeExperience";
import type { PlanHistory } from "../../plan-history/models/PlanHistory";
import type { CoachInsight } from "../../proactive-insights/models/CoachInsight";
import type { WeeklyCoachReport } from "../../weekly-report/models/WeeklyCoachReport";
import type { AthleteWorkspace } from "../models/AthleteWorkspace";
import type { WorkspaceResult } from "../models/WorkspaceResult";
import { buildCoachProjection } from "./buildCoachProjection";
import { buildDailyProjection } from "./buildDailyProjection";
import { buildHomeProjection } from "./buildHomeProjection";
import { buildInsightProjection } from "./buildInsightProjection";
import { buildMetadata } from "./buildMetadata";
import { buildOverview } from "./buildOverview";
import { buildStatus } from "./buildStatus";
import { buildTimelineProjection } from "./buildTimelineProjection";
import { buildWeeklyProjection } from "./buildWeeklyProjection";
import { validateWorkspace } from "./validateWorkspace";

export interface BuildAthleteWorkspaceInput {
  readonly athleteId: string;
  readonly requestId: string;
  readonly generatedAt: string;
  readonly version?: string;
  readonly athleteState?: AthleteState | null;
  readonly homeExperience?: HomeExperience | null;
  readonly dailyBrief?: DailyBrief | null;
  readonly weeklyReport?: WeeklyCoachReport | null;
  readonly timeline?: CoachTimeline | null;
  readonly latestDecisions?: readonly CoachTimelineEntry[];
  readonly latestRestores?: readonly CoachTimelineEntry[];
  readonly planHistory?: PlanHistory | null;
  readonly insights?: readonly CoachInsight[];
  readonly criticalFindings?: readonly CoachInsight[];
  readonly coachingSession?: CoachingSession | null;
  readonly goalProgress?: GoalProgress | null;
  readonly recoveryStatus?: string | null;
  readonly currentPhase?: string | null;
}

/**
 * Composes the complete immutable Athlete Intelligence Workspace.
 */
export function buildAthleteWorkspace(
  input: BuildAthleteWorkspaceInput,
): WorkspaceResult {
  const overview = buildOverview({
    athleteId: input.athleteId,
    generatedAt: input.generatedAt,
    homeExperience: input.homeExperience ?? null,
    dailyBrief: input.dailyBrief ?? null,
    weeklyReport: input.weeklyReport ?? null,
  });
  const status = buildStatus({
    athleteId: input.athleteId,
    athleteState: input.athleteState ?? null,
    goalProgress: input.goalProgress ?? null,
    recoveryStatus: input.recoveryStatus,
    currentPhase: input.currentPhase,
  });
  const home = buildHomeProjection({
    homeExperience: input.homeExperience ?? null,
  });
  const dailyBrief = buildDailyProjection({
    dailyBrief: input.dailyBrief ?? null,
  });
  const weeklyReport = buildWeeklyProjection({
    weeklyReport: input.weeklyReport ?? null,
  });
  const timeline = buildTimelineProjection({
    athleteId: input.athleteId,
    timeline: input.timeline ?? null,
    latestDecisions: input.latestDecisions ?? Object.freeze([]),
    latestRestores: input.latestRestores ?? Object.freeze([]),
    planHistory: input.planHistory ?? null,
  });
  const insights = buildInsightProjection({
    athleteId: input.athleteId,
    insights: input.insights ?? Object.freeze([]),
    criticalFindings: input.criticalFindings ?? Object.freeze([]),
  });
  const coach = buildCoachProjection({
    athleteId: input.athleteId,
    coachingSession: input.coachingSession ?? null,
  });
  const metadata = buildMetadata({
    athleteId: input.athleteId,
    generatedAt: input.generatedAt,
    version: input.version,
    weeklyReport: input.weeklyReport ?? null,
  });

  const workspace: AthleteWorkspace = Object.freeze({
    id: metadata.workspaceId,
    athleteId: input.athleteId,
    overview,
    status,
    home,
    dailyBrief,
    weeklyReport,
    timeline,
    insights,
    coach,
    metadata,
  });

  const validation = validateWorkspace(workspace);
  if (!validation.valid) {
    return Object.freeze({
      id: `athlete-workspace-result:${input.requestId}:invalid`,
      success: false,
      workspace: null,
      overview: null,
      metadata: null,
      validation,
      message: `Athlete workspace validation failed: ${validation.errors.join("; ")}`,
      generatedAt: input.generatedAt,
    });
  }

  return Object.freeze({
    id: `athlete-workspace-result:${input.requestId}`,
    success: true,
    workspace,
    overview,
    metadata,
    validation,
    message:
      "Athlete intelligence workspace composed from existing coaching artifacts.",
    generatedAt: input.generatedAt,
  });
}

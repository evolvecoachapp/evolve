import type { WorkspaceCoach } from "./WorkspaceCoach";
import type { WorkspaceDailyBrief } from "./WorkspaceDailyBrief";
import type { WorkspaceHome } from "./WorkspaceHome";
import type { WorkspaceInsights } from "./WorkspaceInsights";
import type { WorkspaceMetadata } from "./WorkspaceMetadata";
import type { WorkspaceOverview } from "./WorkspaceOverview";
import type { WorkspaceStatus } from "./WorkspaceStatus";
import type { WorkspaceTimeline } from "./WorkspaceTimeline";
import type { WorkspaceWeeklyReport } from "./WorkspaceWeeklyReport";

/**
 * Immutable Athlete Intelligence Workspace (Sprint 28.1).
 *
 * Single read model representing the athlete's current coaching state.
 * Composition only — no new engines, no persistence, no UI, no LLM.
 */
export interface AthleteWorkspace {
  readonly id: string;
  readonly athleteId: string;
  readonly overview: WorkspaceOverview;
  readonly status: WorkspaceStatus;
  readonly home: WorkspaceHome;
  readonly dailyBrief: WorkspaceDailyBrief;
  readonly weeklyReport: WorkspaceWeeklyReport;
  readonly timeline: WorkspaceTimeline;
  readonly insights: WorkspaceInsights;
  readonly coach: WorkspaceCoach;
  readonly metadata: WorkspaceMetadata;
}

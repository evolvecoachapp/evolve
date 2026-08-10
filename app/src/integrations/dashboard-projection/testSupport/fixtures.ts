import { CoachTimelineEventCategories } from "../../../features/coach-timeline/models/CoachTimelineEvent";
import { createTestCoachTimelineService } from "../../../features/coach-timeline/testSupport/fixtures";
import { appendSeedEntry } from "../../../features/proactive-insights/testSupport/fixtures";
import { composeUnifiedWorkspace } from "../../../features/unified-workspace/application";
import { buildUnifiedWorkspace } from "../../../features/unified-workspace/services/buildUnifiedWorkspace";
import {
  createStubAthleteSnapshot,
  createStubAthleteState,
  createStubCoachingSession,
  createStubGoalProgress,
  createStubInsight,
  createTestUnifiedWorkspaceService,
  FIXED_WORKSPACE_TIMESTAMP,
} from "../../../features/unified-workspace/testSupport/fixtures";
import type { Workspace } from "../../../features/unified-workspace/models/Workspace";
import {
  createDashboardProjectionIdentity,
  type DashboardProjectionIdentity,
} from "../models";

export const FIXED_DASHBOARD_ATHLETE_ID = "athlete:1";
export const FIXED_DASHBOARD_PROJECTED_AT = "2026-08-10T10:00:00.000Z";
export const FIXED_DASHBOARD_IDENTITY: DashboardProjectionIdentity =
  createDashboardProjectionIdentity({
    displayName: "Alex Rivera",
    initials: "AR",
    now: new Date(FIXED_DASHBOARD_PROJECTED_AT),
  });

function createTimelineForAthlete(athleteId: string) {
  const timeline = createTestCoachTimelineService();
  appendSeedEntry(timeline, {
    id: `decision:${athleteId}`,
    category: CoachTimelineEventCategories.COACH_DECISION,
    summary: "Hold intensity",
    affectedDomain: "decision",
  });
  return timeline.getTimeline(athleteId);
}

export function createTestWorkspace(
  overrides: {
    readonly athleteId?: string;
    readonly requestId?: string;
  } = {},
): Workspace {
  const athleteId = overrides.athleteId ?? FIXED_DASHBOARD_ATHLETE_ID;
  const timeline = createTimelineForAthlete(athleteId);

  const result = buildUnifiedWorkspace({
    athleteId,
    requestId: overrides.requestId ?? `req-${athleteId}`,
    generatedAt: FIXED_WORKSPACE_TIMESTAMP,
    athleteState: createStubAthleteState({ athleteId }),
    goalProgress: createStubGoalProgress(),
    timeline,
    coachingSession: createStubCoachingSession(),
    snapshot: createStubAthleteSnapshot({ athleteId }),
    insights: Object.freeze([createStubInsight({ id: `ins:${athleteId}` })]),
  });

  if (!result.success || !result.workspace) {
    throw new Error(
      `Failed to create test workspace: ${result.message ?? "unknown error"}`,
    );
  }

  return result.workspace;
}

export function composeTestWorkspaceForAthlete(
  service = createTestUnifiedWorkspaceServiceForDashboard(),
  athleteId = FIXED_DASHBOARD_ATHLETE_ID,
): Workspace {
  const timeline = createTimelineForAthlete(athleteId);

  const composed = composeUnifiedWorkspace({
    service,
    input: {
      athleteId,
      requestId: `req-${athleteId}`,
      athleteState: createStubAthleteState({ athleteId }),
      goalProgress: createStubGoalProgress(),
      timeline,
      coachingSession: createStubCoachingSession(),
      snapshot: createStubAthleteSnapshot({ athleteId }),
      insights: Object.freeze([createStubInsight({ id: `ins:${athleteId}` })]),
      generatedAt: FIXED_WORKSPACE_TIMESTAMP,
    },
  });

  if (!composed.success || !composed.workspace) {
    throw new Error(
      `Failed to compose test workspace: ${composed.message ?? "unknown error"}`,
    );
  }

  return composed.workspace;
}

export function createTestUnifiedWorkspaceServiceForDashboard(
  overrides: {
    readonly clock?: () => string;
  } = {},
) {
  return createTestUnifiedWorkspaceService(overrides);
}

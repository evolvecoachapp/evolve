import { buildAthleteSnapshot } from "../../athlete-snapshot/services/buildAthleteSnapshot";
import type { AthleteSnapshot } from "../../athlete-snapshot/models/AthleteSnapshot";
import {
  createStubAthleteState,
  createStubCoachingSession,
  createStubGoalProgress,
  createStubInsight,
  createStubNutritionPlan,
  createStubPlanHistory,
  createStubRecoveryMetrics,
  createStubSleepProfile,
  createStubWorkoutPlan,
  createTestAthleteSnapshotService,
  FIXED_SNAPSHOT_TIMESTAMP,
} from "../../athlete-snapshot/testSupport/fixtures";
import { createTestCoachTimelineService } from "../../coach-timeline/testSupport/fixtures";
import { CoachTimelineEventCategories } from "../../coach-timeline/models/CoachTimelineEvent";
import { appendSeedEntry } from "../../proactive-insights/testSupport/fixtures";
import {
  createUnifiedWorkspaceService,
  type UnifiedWorkspaceService,
} from "../services/UnifiedWorkspaceService";

export const FIXED_WORKSPACE_TIMESTAMP = FIXED_SNAPSHOT_TIMESTAMP;

export {
  createStubAthleteState,
  createStubCoachingSession,
  createStubGoalProgress,
  createStubInsight,
  createStubNutritionPlan,
  createStubPlanHistory,
  createStubRecoveryMetrics,
  createStubSleepProfile,
  createStubWorkoutPlan,
  createTestAthleteSnapshotService,
};

export function createMinimalIntelligenceWorkspace(
  athleteId = "athlete:1",
  generatedAt = FIXED_WORKSPACE_TIMESTAMP,
) {
  return Object.freeze({
    id: `athlete-workspace:${athleteId}:1`,
    athleteId,
    overview: Object.freeze({ athleteId }),
    status: Object.freeze({ athleteId }),
    home: Object.freeze({ present: true }),
    dailyBrief: Object.freeze({ present: true }),
    weeklyReport: Object.freeze({ present: true }),
    timeline: Object.freeze({ athleteId }),
    insights: Object.freeze({ athleteId }),
    coach: Object.freeze({ athleteId }),
    metadata: Object.freeze({
      generatedAt,
      version: "28.1",
      workspaceId: `athlete-workspace:${athleteId}:1`,
      weekStart: "2026-07-22T12:00:00.000Z",
      weekEnd: generatedAt,
    }),
  }) as never;
}

export function createStubAthleteSnapshot(
  overrides: {
    readonly athleteId?: string;
    readonly createdAt?: string;
  } = {},
): AthleteSnapshot {
  const athleteId = overrides.athleteId ?? "athlete:1";
  const createdAt = overrides.createdAt ?? FIXED_WORKSPACE_TIMESTAMP;
  const timelineService = createTestCoachTimelineService();
  appendSeedEntry(timelineService, {
    id: `decision:${athleteId}`,
    category: CoachTimelineEventCategories.COACH_DECISION,
    summary: "Hold intensity",
    affectedDomain: "decision",
  });

  const result = buildAthleteSnapshot({
    athleteId,
    createdAt,
    athleteState: createStubAthleteState({ athleteId }),
    goalProgress: createStubGoalProgress(),
    workspace: createMinimalIntelligenceWorkspace(athleteId, createdAt),
    timeline: timelineService.getTimeline(athleteId),
    coachingSession: createStubCoachingSession(),
    applicationVersion: "28.2",
    schemaVersion: "1.0",
    snapshotVersion: "28.2",
  });

  if (!result.success || !result.snapshot) {
    throw new Error(
      `Failed to create stub athlete snapshot: ${result.message}`,
    );
  }

  return result.snapshot;
}

export function createTestUnifiedWorkspaceService(
  overrides: {
    readonly clock?: () => string;
  } = {},
): UnifiedWorkspaceService {
  const clock = overrides.clock ?? (() => FIXED_WORKSPACE_TIMESTAMP);
  const snapshotService = createTestAthleteSnapshotService({ clock });
  return createUnifiedWorkspaceService({
    athleteState: null,
    homeExperience: null,
    dailyBrief: null,
    weeklyCoachReport: null,
    coachTimeline: snapshotService.getCoachTimeline(),
    explainableCoachingSession: snapshotService.getExplainableCoachingSession(),
    athleteSnapshot: snapshotService,
    clock,
  });
}

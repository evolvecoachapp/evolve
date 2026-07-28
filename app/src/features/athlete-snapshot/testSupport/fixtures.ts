import {
  createStubCoachingSession,
  createStubGoalProgress,
  createStubInsight,
  createStubNutritionPlan,
  createStubPlanHistory,
  createStubRecoveryMetrics,
  createStubSleepProfile,
  createStubWorkoutPlan,
  createTestWeeklyCoachReportService,
  FIXED_REPORT_TIMESTAMP,
} from "../../weekly-report/testSupport/fixtures";
import type { AthleteState } from "../../athlete-state/models/AthleteState";
import { AthleteStatusKinds } from "../../athlete-state/models/AthleteStatus";
import {
  createAthleteSnapshotService,
  type AthleteSnapshotService,
} from "../services/AthleteSnapshotService";

export const FIXED_SNAPSHOT_TIMESTAMP = FIXED_REPORT_TIMESTAMP;

export {
  createStubCoachingSession,
  createStubGoalProgress,
  createStubInsight,
  createStubNutritionPlan,
  createStubPlanHistory,
  createStubRecoveryMetrics,
  createStubSleepProfile,
  createStubWorkoutPlan,
};

export function createStubAthleteState(
  overrides: {
    readonly athleteId?: string;
    readonly statusKind?: string;
    readonly recoveryStatus?: string | null;
    readonly phase?: string | null;
  } = {},
): AthleteState {
  const athleteId = overrides.athleteId ?? "athlete:1";
  return Object.freeze({
    id: `athlete-state:${athleteId}`,
    athleteId,
    version: Object.freeze({ major: 1, minor: 0, patch: 0, tag: null }),
    identity: Object.freeze({}),
    profile: Object.freeze({}),
    metrics: Object.freeze({}),
    status: Object.freeze({
      kind: overrides.statusKind ?? AthleteStatusKinds.ACTIVE,
      label: "Active",
      notes: Object.freeze([]),
    }),
    bodyComposition: Object.freeze({}),
    bodyMeasurements: Object.freeze({}),
    training: Object.freeze({
      phase: overrides.phase ?? "Strength Block",
      focus: null,
      sessionsPerWeek: 4,
      lastSessionId: null,
      lastSessionAt: null,
      programId: null,
      notes: Object.freeze([]),
      sourceAgentIds: Object.freeze([]),
    }),
    recovery: Object.freeze({
      status: overrides.recoveryStatus ?? "stable",
      lastRecoverySessionId: null,
      lastAssessedAt: null,
      modalities: Object.freeze([]),
      notes: Object.freeze([]),
      sourceAgentIds: Object.freeze([]),
    }),
    nutrition: Object.freeze({}),
    performance: Object.freeze({}),
    lifestyle: Object.freeze({}),
    health: Object.freeze({}),
    readiness: Object.freeze({}),
    fatigue: Object.freeze({}),
    sleep: Object.freeze({}),
    stress: Object.freeze({}),
    hydration: Object.freeze({}),
    energyAvailability: Object.freeze({}),
    goals: Object.freeze({}),
    preferences: Object.freeze({}),
    constraints: Object.freeze({}),
    progress: Object.freeze({}),
    coaching: Object.freeze({}),
    history: Object.freeze({}),
    timeline: Object.freeze({}),
    statistics: Object.freeze({}),
    decisionHistory: Object.freeze({}),
    diagnostics: Object.freeze({}),
    summary: Object.freeze({
      athleteId,
      version: Object.freeze({ major: 1, minor: 0, patch: 0, tag: null }),
      status: overrides.statusKind ?? AthleteStatusKinds.ACTIVE,
      headline: "Athlete ready to train",
      details: Object.freeze(["Recovery stable", "Training on track"]),
      statistics: Object.freeze({}),
      createdAt: FIXED_SNAPSHOT_TIMESTAMP,
    }),
    metadata: Object.freeze({}),
    createdAt: FIXED_SNAPSHOT_TIMESTAMP,
    updatedAt: FIXED_SNAPSHOT_TIMESTAMP,
    frozenAt: FIXED_SNAPSHOT_TIMESTAMP,
  }) as unknown as AthleteState;
}

export function createTestAthleteSnapshotService(
  overrides: {
    readonly clock?: () => string;
  } = {},
): AthleteSnapshotService {
  const clock = overrides.clock ?? (() => FIXED_SNAPSHOT_TIMESTAMP);
  const weekly = createTestWeeklyCoachReportService({ clock });
  return createAthleteSnapshotService({
    athleteState: null,
    athleteWorkspace: null,
    coachTimeline: weekly.getCoachTimeline(),
    explainableCoachingSession: weekly.getExplainableCoachingSession(),
    weeklyCoachReport: weekly,
    clock,
  });
}

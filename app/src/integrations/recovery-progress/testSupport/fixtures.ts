import type { FatigueState } from "../../../features/recovery-agent/models/FatigueState";
import type { ReadinessState } from "../../../features/recovery-agent/models/ReadinessState";
import type { RecoveryAssessment } from "../../../features/recovery-agent/models/RecoveryAssessment";
import type { SleepProfile } from "../../../features/recovery-agent/models/SleepProfile";
import {
  createRecoveryProgressEvent,
  createRecoveryProgressMetadata,
} from "../models";

const FIXED_PUBLISHED_AT = "2026-08-02T20:00:00.000Z";

export function createTestSleepProfile(
  overrides: Partial<SleepProfile> = {},
): SleepProfile {
  return {
    hours: 7.5,
    quality: 82,
    label: "good",
    notes: [],
    ...overrides,
  };
}

export function createTestReadinessState(
  overrides: Partial<ReadinessState> = {},
): ReadinessState {
  return {
    score: 78,
    label: "good",
    notes: [],
    ...overrides,
  };
}

export function createTestFatigueState(
  overrides: Partial<FatigueState> = {},
): FatigueState {
  return {
    level: 35,
    label: "moderate",
    notes: [],
    ...overrides,
  };
}

export function createTestRecoveryAssessment(
  overrides: Partial<RecoveryAssessment> = {},
): RecoveryAssessment {
  return {
    id: "assessment-001",
    recoveryScore: {
      score: 78,
      label: "good",
      components: { sleep: 0.8, stress: 0.7, fatigue: 0.75 },
    },
    readiness: createTestReadinessState(),
    fatigue: createTestFatigueState(),
    sleep: createTestSleepProfile(),
    stress: { level: 30, label: "low", notes: [] },
    trainingLoad: { score: 65, tolerance: "moderate", notes: [] },
    indicators: {
      sleepQuality: 82,
      stressLevel: 30,
      fatigueLevel: 35,
      sorenessLevel: 25,
      hrvScore: 68,
      readinessScore: 78,
      trainingLoadScore: 65,
      recoveryScore: 78,
    },
    deload: {
      recommended: false,
      intensity: "none",
      rationale: "Load is manageable.",
      durationDays: 0,
    },
    confidence: { score: 0.85, label: "high", rationale: "Complete data." },
    summary: "Recovery is good.",
    assessedAt: FIXED_PUBLISHED_AT,
    ...overrides,
  };
}

export function createTestRecoveryProgressEvent(
  overrides: Partial<ReturnType<typeof createRecoveryProgressEvent>> = {},
) {
  return createRecoveryProgressEvent({
    id: "evt-001",
    type: "RecoveryDayStarted",
    occurredAt: FIXED_PUBLISHED_AT,
    metadata: createRecoveryProgressMetadata({
      source: "recovery",
      correlationId: "corr-001",
      dayId: "2026-08-02",
      assessmentId: null,
      athleteId: null,
      publishedAt: FIXED_PUBLISHED_AT,
    }),
    payload: Object.freeze({
      dayId: "2026-08-02",
      assessmentId: null,
      recoveryScore: 78,
      readinessScore: 78,
      readinessLabel: "good",
      fatigueLevel: 35,
      fatigueLabel: "moderate",
      sleepHours: 7.5,
      sleepQuality: 82,
      stressLevel: 30,
      stressLabel: "low",
      hrvScore: 68,
      restingHeartRate: null,
      trainingLoadScore: 65,
      assessedAt: null,
      completedAt: null,
      metrics: Object.freeze([]),
    }),
    ...overrides,
  });
}

export { FIXED_PUBLISHED_AT };

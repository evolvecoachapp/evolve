import type { RecoveryMetric } from "./RecoveryMetric";

/** Immutable analytics payload projected from recovery domain state. */
export interface RecoveryAnalyticsPayload {
  readonly dayId: string;
  readonly assessmentId: string | null;
  readonly recoveryScore: number | null;
  readonly readinessScore: number | null;
  readonly readinessLabel: string | null;
  readonly fatigueLevel: number | null;
  readonly fatigueLabel: string | null;
  readonly sleepHours: number | null;
  readonly sleepQuality: number | null;
  readonly stressLevel: number | null;
  readonly stressLabel: string | null;
  readonly hrvScore: number | null;
  readonly restingHeartRate: number | null;
  readonly trainingLoadScore: number | null;
  readonly assessedAt: string | null;
  readonly completedAt: string | null;
  readonly metrics: readonly RecoveryMetric[];
}

export function createRecoveryAnalyticsPayload(
  input: RecoveryAnalyticsPayload,
): RecoveryAnalyticsPayload {
  return Object.freeze({
    ...input,
    metrics: Object.freeze([...input.metrics]),
  });
}

export function createEmptyRecoveryAnalyticsPayload(
  dayId: string,
): RecoveryAnalyticsPayload {
  return createRecoveryAnalyticsPayload({
    dayId,
    assessmentId: null,
    recoveryScore: null,
    readinessScore: null,
    readinessLabel: null,
    fatigueLevel: null,
    fatigueLabel: null,
    sleepHours: null,
    sleepQuality: null,
    stressLevel: null,
    stressLabel: null,
    hrvScore: null,
    restingHeartRate: null,
    trainingLoadScore: null,
    assessedAt: null,
    completedAt: null,
    metrics: [],
  });
}

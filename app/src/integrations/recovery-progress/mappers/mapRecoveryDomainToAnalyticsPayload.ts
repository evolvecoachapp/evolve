import type { RecoveryAssessment } from "../../../features/recovery-agent/models/RecoveryAssessment";
import type { ReadinessState } from "../../../features/recovery-agent/models/ReadinessState";
import type { SleepProfile } from "../../../features/recovery-agent/models/SleepProfile";
import {
  createEmptyRecoveryAnalyticsPayload,
  createRecoveryAnalyticsPayload,
  type RecoveryAnalyticsPayload,
} from "../models";

export function mapRecoveryAssessmentToAssessedPayload(
  assessment: RecoveryAssessment,
  dayId: string,
): RecoveryAnalyticsPayload {
  return createRecoveryAnalyticsPayload({
    dayId,
    assessmentId: assessment.id,
    recoveryScore: assessment.recoveryScore.score,
    readinessScore: assessment.readiness.score,
    readinessLabel: assessment.readiness.label,
    fatigueLevel: assessment.fatigue.level,
    fatigueLabel: assessment.fatigue.label,
    sleepHours: assessment.sleep.hours,
    sleepQuality: assessment.sleep.quality,
    stressLevel: assessment.stress.level,
    stressLabel: assessment.stress.label,
    hrvScore: assessment.indicators.hrvScore,
    restingHeartRate: null,
    trainingLoadScore: assessment.trainingLoad.score,
    assessedAt: assessment.assessedAt,
    completedAt: assessment.assessedAt,
    metrics: [],
  });
}

export function mapSleepProfileToLoggedPayload(
  sleep: SleepProfile,
  dayId: string,
  loggedAt: string,
): RecoveryAnalyticsPayload {
  return createRecoveryAnalyticsPayload({
    ...createEmptyRecoveryAnalyticsPayload(dayId),
    sleepHours: sleep.hours,
    sleepQuality: sleep.quality,
    completedAt: loggedAt,
  });
}

export function mapReadinessStateToUpdatedPayload(
  readiness: ReadinessState,
  dayId: string,
  updatedAt: string,
): RecoveryAnalyticsPayload {
  return createRecoveryAnalyticsPayload({
    ...createEmptyRecoveryAnalyticsPayload(dayId),
    readinessScore: readiness.score,
    readinessLabel: readiness.label,
    completedAt: updatedAt,
  });
}

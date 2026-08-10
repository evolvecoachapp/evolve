import { getCompositionRoot } from "../../../core/composition/createCompositionRoot";
import type { RecoveryAssessment } from "../../recovery-agent/models/RecoveryAssessment";
import type { ReadinessState } from "../../recovery-agent/models/ReadinessState";
import type { SleepProfile } from "../../recovery-agent/models/SleepProfile";
import {
  publishReadinessUpdated,
  publishRecoveryAssessed,
  publishSleepLogged,
} from "../../../integrations/recovery-progress/application";
import type { RecoveryDashboard } from "../models";

export interface PublishRecoveryRuntimeSleepProgressOptions {
  readonly dashboard: RecoveryDashboard;
  readonly sleep: SleepProfile;
  readonly athleteId: string;
  readonly loggedAt: string;
  readonly correlationId?: string;
  readonly eventId?: string;
  readonly publishedAt?: string;
}

/** Publishes SleepLogged through the Sprint 32.3 integration. */
export async function publishRecoveryRuntimeSleepProgress({
  dashboard,
  sleep,
  athleteId,
  loggedAt,
  correlationId = `recovery-runtime:sleep:${dashboard.day.isoDate}`,
  eventId = `recovery-runtime:sleep:${dashboard.day.isoDate}:${loggedAt}`,
  publishedAt = loggedAt,
}: PublishRecoveryRuntimeSleepProgressOptions): Promise<void> {
  const publisher = getCompositionRoot().resolve("RecoveryProgressPublisher");

  await publishSleepLogged({
    publisher,
    sleep,
    dayId: dashboard.day.isoDate,
    correlationId,
    eventId,
    loggedAt,
    publishedAt,
    athleteId,
  });
}

export interface PublishRecoveryRuntimeReadinessProgressOptions {
  readonly dashboard: RecoveryDashboard;
  readonly readiness: ReadinessState;
  readonly athleteId: string;
  readonly updatedAt: string;
  readonly correlationId?: string;
  readonly eventId?: string;
  readonly publishedAt?: string;
}

/** Publishes ReadinessUpdated through the Sprint 32.3 integration. */
export async function publishRecoveryRuntimeReadinessProgress({
  dashboard,
  readiness,
  athleteId,
  updatedAt,
  correlationId = `recovery-runtime:readiness:${dashboard.day.isoDate}`,
  eventId = `recovery-runtime:readiness:${dashboard.day.isoDate}:${updatedAt}`,
  publishedAt = updatedAt,
}: PublishRecoveryRuntimeReadinessProgressOptions): Promise<void> {
  const publisher = getCompositionRoot().resolve("RecoveryProgressPublisher");

  await publishReadinessUpdated({
    publisher,
    readiness,
    dayId: dashboard.day.isoDate,
    correlationId,
    eventId,
    updatedAt,
    publishedAt,
    athleteId,
  });
}

export interface PublishRecoveryRuntimeAssessmentProgressOptions {
  readonly dashboard: RecoveryDashboard;
  readonly assessment: RecoveryAssessment;
  readonly athleteId: string;
  readonly assessedAt: string;
  readonly correlationId?: string;
  readonly eventId?: string;
  readonly publishedAt?: string;
}

/** Publishes RecoveryAssessed through the Sprint 32.3 integration. */
export async function publishRecoveryRuntimeAssessmentProgress({
  dashboard,
  assessment,
  athleteId,
  assessedAt,
  correlationId = `recovery-runtime:assessment:${dashboard.day.isoDate}`,
  eventId = `recovery-runtime:assessment:${assessment.id}`,
  publishedAt = assessedAt,
}: PublishRecoveryRuntimeAssessmentProgressOptions): Promise<void> {
  const publisher = getCompositionRoot().resolve("RecoveryProgressPublisher");

  await publishRecoveryAssessed({
    publisher,
    assessment,
    dayId: dashboard.day.isoDate,
    correlationId,
    eventId,
    publishedAt,
    athleteId,
  });
}

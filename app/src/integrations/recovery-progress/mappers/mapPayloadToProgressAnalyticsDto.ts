import type { RecoveryProgressIngestDto } from "../../../features/progress-analytics/services/ProgressAnalyticsService";
import type { RecoveryProgressEvent } from "../models";

/** Maps an immutable integration event to the Progress Analytics contract DTO. */
export function mapPayloadToProgressAnalyticsDto(
  event: RecoveryProgressEvent,
): RecoveryProgressIngestDto {
  return Object.freeze({
    eventId: event.id,
    eventType: event.type,
    occurredAt: event.occurredAt,
    metadata: Object.freeze({
      source: event.metadata.source,
      correlationId: event.metadata.correlationId,
      dayId: event.metadata.dayId,
      assessmentId: event.metadata.assessmentId,
      athleteId: event.metadata.athleteId,
      publishedAt: event.metadata.publishedAt,
    }),
    payload: Object.freeze({
      dayId: event.payload.dayId,
      assessmentId: event.payload.assessmentId,
      recoveryScore: event.payload.recoveryScore,
      readinessScore: event.payload.readinessScore,
      readinessLabel: event.payload.readinessLabel,
      fatigueLevel: event.payload.fatigueLevel,
      fatigueLabel: event.payload.fatigueLabel,
      sleepHours: event.payload.sleepHours,
      sleepQuality: event.payload.sleepQuality,
      stressLevel: event.payload.stressLevel,
      stressLabel: event.payload.stressLabel,
      hrvScore: event.payload.hrvScore,
      restingHeartRate: event.payload.restingHeartRate,
      trainingLoadScore: event.payload.trainingLoadScore,
      assessedAt: event.payload.assessedAt,
      completedAt: event.payload.completedAt,
      metrics: Object.freeze(
        event.payload.metrics.map((metric) =>
          Object.freeze({
            key: metric.key,
            label: metric.label,
            value: metric.value,
            unit: metric.unit,
          }),
        ),
      ),
    }),
  });
}

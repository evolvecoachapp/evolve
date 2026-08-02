import type { WorkoutProgressIngestDto } from "../../../features/progress-analytics/services/ProgressAnalyticsService";
import type { WorkoutProgressEvent } from "../models";

/** Maps an immutable integration event to the Progress Analytics contract DTO. */
export function mapPayloadToProgressAnalyticsDto(
  event: WorkoutProgressEvent,
): WorkoutProgressIngestDto {
  return Object.freeze({
    eventId: event.id,
    eventType: event.type,
    occurredAt: event.occurredAt,
    metadata: Object.freeze({
      source: event.metadata.source,
      correlationId: event.metadata.correlationId,
      sessionId: event.metadata.sessionId,
      workoutId: event.metadata.workoutId,
      athleteId: event.metadata.athleteId,
      publishedAt: event.metadata.publishedAt,
    }),
    payload: Object.freeze({
      sessionId: event.payload.sessionId,
      workoutId: event.payload.workoutId,
      workoutTitle: event.payload.workoutTitle,
      exerciseId: event.payload.exerciseId,
      exerciseName: event.payload.exerciseName,
      setId: event.payload.setId,
      setNumber: event.payload.setNumber,
      weightKg: event.payload.weightKg,
      reps: event.payload.reps,
      volumeKg: event.payload.volumeKg,
      durationMinutes: event.payload.durationMinutes,
      exerciseCount: event.payload.exerciseCount,
      rpeAverage: event.payload.rpeAverage,
      personalRecordId: event.payload.personalRecordId,
      estimatedOneRepMaxKg: event.payload.estimatedOneRepMaxKg,
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

import type { GoalProgressIngestDto } from "../../../features/progress-analytics/services/ProgressAnalyticsService";
import type { GoalProgressEvent } from "../models";

/** Maps an immutable integration event to the Progress Analytics contract DTO. */
export function mapPayloadToProgressAnalyticsDto(
  event: GoalProgressEvent,
): GoalProgressIngestDto {
  return Object.freeze({
    eventId: event.id,
    eventType: event.type,
    occurredAt: event.occurredAt,
    metadata: Object.freeze({
      source: event.metadata.source,
      correlationId: event.metadata.correlationId,
      goalId: event.metadata.goalId,
      snapshotId: event.metadata.snapshotId,
      athleteId: event.metadata.athleteId,
      publishedAt: event.metadata.publishedAt,
    }),
    payload: Object.freeze({
      goalId: event.payload.goalId,
      snapshotId: event.payload.snapshotId,
      title: event.payload.title,
      category: event.payload.category,
      currentValue: event.payload.currentValue,
      targetValue: event.payload.targetValue,
      unit: event.payload.unit,
      completionPercent: event.payload.completionPercent,
      status: event.payload.status,
      evaluatedAt: event.payload.evaluatedAt,
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

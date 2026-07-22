import type { PerformanceSnapshot } from "../../performance-engine/models/PerformanceSnapshot";
import type { HistoryContext } from "../models/HistoryContext";
import { HistoryEntryCategories } from "../models/HistoryEntryCategory";
import { HistoryEntryTypes } from "../models/HistoryEntryType";
import type { PerformanceHistoryEntry } from "../models/PerformanceHistoryEntry";
import { freezePerformanceHistoryEntry } from "../utils/freezeHistory";

/**
 * Aggregate a PerformanceSnapshot into an immutable PerformanceHistoryEntry.
 * One responsibility: performance snapshot → history entry.
 */
export class PerformanceAggregator {
  aggregate(
    snapshot: PerformanceSnapshot,
    context: HistoryContext,
    frozenAt: string,
  ): PerformanceHistoryEntry {
    const tonnage = snapshot.metrics.volume.tonnage;
    const grade = snapshot.grade;
    const occurredAt =
      snapshot.session.completedAt ??
      snapshot.context.analyzedAt ??
      snapshot.frozenAt;

    return freezePerformanceHistoryEntry({
      id: `hist:performance:${snapshot.id}`,
      type: HistoryEntryTypes.PERFORMANCE,
      category: HistoryEntryCategories.PERFORMANCE,
      occurredAt,
      title: `Performance snapshot (${grade})`,
      description: `Grade ${grade} — tonnage ${tonnage}`,
      references: Object.freeze([
        Object.freeze({
          kind: "performance_snapshot",
          id: snapshot.id,
          label: "PerformanceSnapshot",
        }),
        Object.freeze({
          kind: "workout_runtime",
          id: snapshot.session.runtimeId,
          label: "WorkoutRuntime",
        }),
        Object.freeze({
          kind: "workout_session",
          id: snapshot.session.sessionId,
          label: "WorkoutSession",
        }),
      ]),
      evidence: Object.freeze({
        sourceType: "PerformanceSnapshot",
        sourceId: snapshot.id,
        attributes: Object.freeze({
          grade,
          tonnage,
          totalCompletedSets: snapshot.metrics.volume.totalCompletedSets,
          totalCompletedRepetitions:
            snapshot.metrics.volume.totalCompletedRepetitions,
          workoutCompletionPercent:
            snapshot.metrics.completion.workoutCompletionPercent,
        }),
      }),
      context,
      metadata: Object.freeze({
        tags: Object.freeze(["performance", String(grade).toLowerCase()]),
        attributes: Object.freeze({
          snapshotId: snapshot.id,
          grade: String(grade),
        }),
      }),
      frozenAt,
      performanceSnapshotId: snapshot.id,
      grade: String(grade),
      tonnage,
    });
  }
}

export function createPerformanceAggregator(): PerformanceAggregator {
  return new PerformanceAggregator();
}

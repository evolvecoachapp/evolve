import type { PerformanceSnapshot } from "../models/PerformanceSnapshot";
import type { PerformanceSummary } from "../models/PerformanceSummary";
import type { PerformanceEngineResult } from "../models/PerformanceEngineResult";

/**
 * Deep-freeze a performance snapshot for immutability guarantees.
 */
export function freezeSnapshot(
  snapshot: PerformanceSnapshot,
): PerformanceSnapshot {
  return Object.freeze({
    ...snapshot,
    context: Object.freeze({ ...snapshot.context }),
    session: Object.freeze({
      ...snapshot.session,
      metrics: freezeMetrics(snapshot.session.metrics),
    }),
    metrics: freezeMetrics(snapshot.metrics),
    exercises: Object.freeze(
      snapshot.exercises.map((exercise) => Object.freeze({ ...exercise })),
    ),
    movements: Object.freeze(
      snapshot.movements.map((movement) => Object.freeze({ ...movement })),
    ),
    summary: Object.freeze({ ...snapshot.summary }),
    trend: Object.freeze({ ...snapshot.trend }),
  });
}

function freezeMetrics(
  metrics: PerformanceSnapshot["metrics"],
): PerformanceSnapshot["metrics"] {
  return Object.freeze({
    volume: Object.freeze({ ...metrics.volume }),
    intensity: Object.freeze({ ...metrics.intensity }),
    density: Object.freeze({ ...metrics.density }),
    completion: Object.freeze({ ...metrics.completion }),
  });
}

export function freezeSummary(
  summary: PerformanceSummary,
): PerformanceSummary {
  return Object.freeze({ ...summary });
}

export function freezeEngineResult(
  result: PerformanceEngineResult,
): PerformanceEngineResult {
  return Object.freeze({
    snapshot: freezeSnapshot(result.snapshot),
    summary: freezeSummary(result.summary),
    validationIssues: Object.freeze([...result.validationIssues]),
  });
}

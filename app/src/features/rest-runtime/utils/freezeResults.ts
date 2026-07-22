import type { RestResult } from "../models/RestResult";
import type { RestRuntime } from "../models/RestRuntime";
import type { RestSummary } from "../models/RestSummary";
import { buildSummary } from "./buildSummary";

/**
 * Deep-freeze a rest runtime snapshot.
 */
export function freezeRuntime(runtime: RestRuntime): RestRuntime {
  return Object.freeze({
    ...runtime,
    session: Object.freeze({
      ...runtime.session,
      target: Object.freeze({
        ...runtime.session.target,
        duration: Object.freeze({ ...runtime.session.target.duration }),
      }),
    }),
    progress: Object.freeze({ ...runtime.progress }),
    metrics: Object.freeze({ ...runtime.metrics }),
    configuration: Object.freeze({ ...runtime.configuration }),
    events: Object.freeze(
      runtime.events.map((event) => Object.freeze({ ...event })),
    ),
  });
}

/**
 * Freeze a public summary.
 */
export function freezeSummary(summary: RestSummary): RestSummary {
  return Object.freeze({
    ...summary,
    progress: Object.freeze({ ...summary.progress }),
  });
}

/**
 * Build and freeze a terminal RestResult from a runtime.
 */
export function freezeResult(
  runtime: RestRuntime,
  frozenAt: string,
): RestResult {
  if (
    runtime.state !== "Completed" &&
    runtime.state !== "Cancelled" &&
    runtime.state !== "Expired"
  ) {
    throw new Error(`cannot_freeze_result_from:${runtime.state}`);
  }

  const summary = freezeSummary(buildSummary(runtime));

  return Object.freeze({
    runtimeId: runtime.id,
    sessionId: runtime.sessionId,
    finalState: runtime.state,
    summary,
    progress: Object.freeze({ ...runtime.progress }),
    metrics: Object.freeze({ ...runtime.metrics }),
    events: Object.freeze(
      runtime.events.map((event) => Object.freeze({ ...event })),
    ),
    reason: runtime.session.reason,
    startedAt: runtime.startedAt,
    completedAt: runtime.completedAt,
    cancelledAt: runtime.cancelledAt,
    expiredAt: runtime.expiredAt,
    frozenAt,
  });
}

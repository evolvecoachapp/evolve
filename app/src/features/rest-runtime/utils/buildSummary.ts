import type { RestRuntime } from "../models/RestRuntime";
import type { RestSummary } from "../models/RestSummary";

export { buildMetrics } from "./calculateProgress";

/**
 * Generate a public rest runtime summary snapshot.
 */
export function buildSummary(runtime: RestRuntime): RestSummary {
  return Object.freeze({
    runtimeId: runtime.id,
    sessionId: runtime.sessionId,
    state: runtime.state,
    status: runtime.status,
    reason: runtime.session.reason,
    progress: runtime.progress,
    targetDurationMs: runtime.configuration.targetDurationMs,
    elapsedMs: runtime.progress.elapsedMs,
    remainingMs: runtime.progress.remainingMs,
    overtimeMs: runtime.progress.overtimeMs,
    eventCount: runtime.events.length,
    startedAt: runtime.startedAt,
    pausedAt: runtime.pausedAt,
  });
}

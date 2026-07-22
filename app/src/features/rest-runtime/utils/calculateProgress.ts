import type { RestMetrics } from "../models/RestMetrics";
import type { RestProgress } from "../models/RestProgress";
import type { RestState } from "../models/RestState";
import type { RestStatus } from "../models/RestStatus";

/**
 * Calculate remaining time from target and elapsed.
 */
export function calculateRemainingMs(
  targetDurationMs: number,
  elapsedMs: number,
): number {
  return Math.max(0, targetDurationMs - elapsedMs);
}

/**
 * Calculate overtime beyond target.
 */
export function calculateOvertimeMs(
  targetDurationMs: number,
  elapsedMs: number,
): number {
  return Math.max(0, elapsedMs - targetDurationMs);
}

/**
 * Completion percent of target (0–100).
 */
export function calculateCompletionPercent(
  targetDurationMs: number,
  elapsedMs: number,
): number {
  if (targetDurationMs <= 0) {
    return 100;
  }
  return Math.min(100, Math.round((elapsedMs / targetDurationMs) * 100));
}

/**
 * Calculate aggregate rest progress from timing values.
 */
export function calculateProgress(
  targetDurationMs: number,
  elapsedMs: number,
): RestProgress {
  const remainingMs = calculateRemainingMs(targetDurationMs, elapsedMs);
  const overtimeMs = calculateOvertimeMs(targetDurationMs, elapsedMs);

  return Object.freeze({
    targetDurationMs,
    elapsedMs,
    remainingMs,
    overtimeMs,
    completionPercent: calculateCompletionPercent(targetDurationMs, elapsedMs),
    isOvertime: overtimeMs > 0,
  });
}

/**
 * Derive RestStatus from lifecycle state and progress.
 */
export function deriveRestStatus(
  state: RestState,
  progress: RestProgress,
): RestStatus {
  if (state === "Idle") {
    return "Idle";
  }
  if (state === "Paused") {
    return "Paused";
  }
  if (state === "Cancelled") {
    return "Cancelled";
  }
  if (state === "Completed" || state === "Expired") {
    return "Finished";
  }
  // Running
  if (progress.isOvertime) {
    return "Overtime";
  }
  if (progress.remainingMs === 0) {
    return "OnTarget";
  }
  return "Counting";
}

export function buildMetrics(input: {
  readonly targetDurationMs: number;
  readonly elapsedMs: number;
  readonly pauseCount: number;
  readonly eventCount: number;
  readonly updateCount: number;
}): RestMetrics {
  const progress = calculateProgress(input.targetDurationMs, input.elapsedMs);
  return Object.freeze({
    targetDurationMs: progress.targetDurationMs,
    elapsedMs: progress.elapsedMs,
    remainingMs: progress.remainingMs,
    overtimeMs: progress.overtimeMs,
    pauseCount: input.pauseCount,
    eventCount: input.eventCount,
    updateCount: input.updateCount,
  });
}

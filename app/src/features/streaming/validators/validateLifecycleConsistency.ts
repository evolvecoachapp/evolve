import type { StreamLifecycle } from "../models/StreamLifecycle";
import type { StreamState } from "../models/StreamState";
import { StreamEventTypes } from "../models/StreamEventType";
import { StreamStatuses, isTerminalStreamStatus } from "../models/StreamStatus";

/**
 * Validate lifecycle event / status consistency.
 */
export function validateLifecycleConsistency(
  lifecycle: StreamLifecycle,
  state?: StreamState,
): readonly string[] {
  const issues: string[] = [];

  if (!lifecycle) {
    return Object.freeze(["stream_lifecycle_missing"]);
  }

  if (state && lifecycle.status !== state.status) {
    issues.push(
      `stream_lifecycle_status_mismatch:lifecycle_${lifecycle.status}_state_${state.status}`,
    );
  }

  const types = new Set(lifecycle.events.map((event) => event.type));

  if (
    lifecycle.status !== StreamStatuses.PENDING &&
    !types.has(StreamEventTypes.STREAM_STARTED) &&
    lifecycle.events.length > 0
  ) {
    // Soft: started event expected once lifecycle has progressed
    if (
      lifecycle.status === StreamStatuses.STARTING ||
      lifecycle.status === StreamStatuses.STREAMING ||
      isTerminalStreamStatus(lifecycle.status)
    ) {
      issues.push("stream_lifecycle_missing_started_event");
    }
  }

  if (
    lifecycle.status === StreamStatuses.COMPLETED &&
    !types.has(StreamEventTypes.STREAM_COMPLETED)
  ) {
    issues.push("stream_lifecycle_missing_completed_event");
  }

  if (
    lifecycle.status === StreamStatuses.CANCELLED &&
    !types.has(StreamEventTypes.STREAM_CANCELLED)
  ) {
    issues.push("stream_lifecycle_missing_cancelled_event");
  }

  if (
    lifecycle.status === StreamStatuses.FAILED &&
    !types.has(StreamEventTypes.STREAM_FAILED)
  ) {
    issues.push("stream_lifecycle_missing_failed_event");
  }

  if (isTerminalStreamStatus(lifecycle.status) && !lifecycle.completedAt) {
    issues.push("stream_lifecycle_terminal_without_completed_at");
  }

  return Object.freeze(issues);
}

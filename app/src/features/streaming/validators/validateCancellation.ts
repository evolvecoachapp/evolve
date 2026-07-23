import type { StreamCancellation } from "../models/StreamCancellation";
import type { StreamState } from "../models/StreamState";
import { StreamStatuses } from "../models/StreamStatus";

/**
 * Validate cancellation consistency.
 */
export function validateCancellation(
  cancellation: StreamCancellation,
  state?: StreamState,
): readonly string[] {
  const issues: string[] = [];

  if (!cancellation) {
    return Object.freeze(["stream_cancellation_missing"]);
  }

  if (cancellation.requested && !cancellation.reason && !cancellation.token) {
    issues.push("stream_cancellation_requested_without_reason_or_token");
  }

  if (state?.status === StreamStatuses.CANCELLED) {
    if (!state.cancellation.requested) {
      issues.push("stream_cancelled_without_cancellation_flag");
    }
    if (!state.completedAt) {
      issues.push("stream_cancelled_without_timestamp");
    }
  }

  if (
    state?.cancellation.requested &&
    state.status !== StreamStatuses.CANCELLED &&
    state.status !== StreamStatuses.PENDING &&
    state.status !== StreamStatuses.STARTING &&
    state.status !== StreamStatuses.STREAMING
  ) {
    issues.push(
      `stream_cancellation_status_mismatch:${state.status}`,
    );
  }

  return Object.freeze(issues);
}

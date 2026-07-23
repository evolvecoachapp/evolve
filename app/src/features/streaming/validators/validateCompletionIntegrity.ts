import type { StreamState } from "../models/StreamState";
import { StreamStatuses } from "../models/StreamStatus";

/**
 * Validate completion integrity against stream state.
 */
export function validateCompletionIntegrity(
  state: StreamState,
): readonly string[] {
  const issues: string[] = [];

  if (!state) {
    return Object.freeze(["stream_state_missing"]);
  }

  if (state.status === StreamStatuses.COMPLETED) {
    if (!state.completion.completed) {
      issues.push("stream_completion_flag_missing");
    }
    if (!state.completedAt) {
      issues.push("stream_completion_timestamp_missing");
    }
    if (!state.completion.completedAt) {
      issues.push("stream_completion_completed_at_missing");
    }
    if (state.error) {
      issues.push("stream_completion_has_error");
    }
  }

  if (state.completion.completed && state.status !== StreamStatuses.COMPLETED) {
    issues.push(
      `stream_completion_status_mismatch:${state.status}`,
    );
  }

  return Object.freeze(issues);
}

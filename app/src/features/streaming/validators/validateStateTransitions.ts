import type { StreamStatus } from "../models/StreamStatus";
import { canTransitionStreamStatus } from "../utils/normalizeStreamState";

/**
 * Validate a single status transition.
 */
export function validateStateTransition(
  from: StreamStatus,
  to: StreamStatus,
): readonly string[] {
  if (!canTransitionStreamStatus(from, to)) {
    return Object.freeze([
      `stream_state_transition_invalid:${from}->${to}`,
    ]);
  }
  return Object.freeze([] as string[]);
}

/**
 * Validate an ordered sequence of statuses.
 */
export function validateStateTransitions(
  statuses: readonly StreamStatus[],
): readonly string[] {
  const issues: string[] = [];

  if (!statuses || statuses.length === 0) {
    return Object.freeze(["stream_state_transitions_missing"]);
  }

  for (let i = 1; i < statuses.length; i += 1) {
    const from = statuses[i - 1]!;
    const to = statuses[i]!;
    issues.push(...validateStateTransition(from, to));
  }

  return Object.freeze(issues);
}

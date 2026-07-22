import type { RestState } from "../models/RestState";

const ALLOWED_TRANSITIONS: Readonly<
  Record<RestState, readonly RestState[]>
> = Object.freeze({
  Idle: Object.freeze(["Running", "Cancelled"] as const),
  Running: Object.freeze([
    "Paused",
    "Completed",
    "Cancelled",
    "Expired",
  ] as const),
  Paused: Object.freeze([
    "Running",
    "Completed",
    "Cancelled",
    "Expired",
  ] as const),
  Completed: Object.freeze([] as const),
  Cancelled: Object.freeze([] as const),
  Expired: Object.freeze([] as const),
});

/**
 * Whether a rest state transition is allowed.
 */
export function canTransitionRestState(
  from: RestState,
  to: RestState,
): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}

/**
 * Validate a proposed state transition. Returns issue codes (empty if valid).
 */
export function validateStateTransition(
  from: RestState,
  to: RestState,
): readonly string[] {
  if (from === to) {
    return Object.freeze([`noop_transition:${from}`]);
  }
  if (!canTransitionRestState(from, to)) {
    return Object.freeze([`invalid_transition:${from}->${to}`]);
  }
  return Object.freeze([]);
}

export function getAllowedRestTransitions(
  from: RestState,
): readonly RestState[] {
  return ALLOWED_TRANSITIONS[from];
}

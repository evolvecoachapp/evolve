import type { SynchronizationState } from "../models/SynchronizationState";
import { isSynchronizationState } from "../models/SynchronizationState";

/**
 * Allowed deterministic lifecycle transitions.
 * Representation / validation only — no background workers.
 */
export const SYNCHRONIZATION_STATE_TRANSITIONS: Readonly<
  Record<SynchronizationState, readonly SynchronizationState[]>
> = Object.freeze({
  idle: Object.freeze(["pending", "paused"] as const),
  pending: Object.freeze(["running", "failed", "paused", "idle"] as const),
  running: Object.freeze(["completed", "failed", "paused"] as const),
  completed: Object.freeze(["idle"] as const),
  failed: Object.freeze(["idle", "pending"] as const),
  paused: Object.freeze(["idle", "pending", "running"] as const),
});

export function canTransitionSynchronizationState(
  from: SynchronizationState,
  to: SynchronizationState,
): boolean {
  if (!isSynchronizationState(from) || !isSynchronizationState(to)) {
    return false;
  }
  return SYNCHRONIZATION_STATE_TRANSITIONS[from].includes(to);
}

export {
  SYNCHRONIZATION_STATES,
  isSynchronizationState,
  type SynchronizationState,
} from "../models/SynchronizationState";

/**
 * Synchronization lifecycle states.
 * Representation only — no networking, no background execution.
 */
export const SYNCHRONIZATION_STATES = [
  "idle",
  "pending",
  "running",
  "completed",
  "failed",
  "paused",
] as const;

export type SynchronizationState = (typeof SYNCHRONIZATION_STATES)[number];

export function isSynchronizationState(
  value: string,
): value is SynchronizationState {
  return (SYNCHRONIZATION_STATES as readonly string[]).includes(value);
}

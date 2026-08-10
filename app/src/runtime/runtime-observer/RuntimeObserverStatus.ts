/**
 * Lifecycle status for the Runtime Change Observer.
 */
export type RuntimeObserverStatus =
  | "idle"
  | "observing"
  | "ready"
  | "failed";

export const RUNTIME_OBSERVER_STATUS = {
  idle: "idle",
  observing: "observing",
  ready: "ready",
  failed: "failed",
} as const satisfies Record<string, RuntimeObserverStatus>;

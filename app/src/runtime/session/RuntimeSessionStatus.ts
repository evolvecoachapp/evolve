/**
 * Lifecycle status for the Runtime Session orchestrator.
 */
export type RuntimeSessionStatus =
  | "idle"
  | "starting"
  | "ready"
  | "failed";

export const RUNTIME_SESSION_STATUS = {
  idle: "idle",
  starting: "starting",
  ready: "ready",
  failed: "failed",
} as const satisfies Record<string, RuntimeSessionStatus>;

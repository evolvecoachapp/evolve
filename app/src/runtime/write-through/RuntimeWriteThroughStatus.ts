/**
 * Lifecycle status for the Runtime Write-Through pipeline.
 */
export type RuntimeWriteThroughStatus =
  | "idle"
  | "persisting"
  | "ready"
  | "failed";

export const RUNTIME_WRITE_THROUGH_STATUS = {
  idle: "idle",
  persisting: "persisting",
  ready: "ready",
  failed: "failed",
} as const satisfies Record<string, RuntimeWriteThroughStatus>;

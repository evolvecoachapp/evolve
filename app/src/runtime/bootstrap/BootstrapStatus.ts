/**
 * Lifecycle status for the application Runtime Bootstrap gate.
 */
export type BootstrapStatus = "idle" | "bootstrapping" | "ready" | "failed";

export const BOOTSTRAP_STATUS = {
  idle: "idle",
  bootstrapping: "bootstrapping",
  ready: "ready",
  failed: "failed",
} as const satisfies Record<string, BootstrapStatus>;

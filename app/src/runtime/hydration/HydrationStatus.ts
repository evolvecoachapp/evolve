/**
 * Lifecycle status for the Repository Hydration pipeline.
 */
export type HydrationStatus = "idle" | "hydrating" | "ready" | "failed";

export const HYDRATION_STATUS = {
  idle: "idle",
  hydrating: "hydrating",
  ready: "ready",
  failed: "failed",
} as const satisfies Record<string, HydrationStatus>;

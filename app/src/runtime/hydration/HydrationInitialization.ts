/**
 * Ordered phases recorded when repository hydration completes successfully.
 */
export type HydrationPhase =
  | "bootstrap_ready_validated"
  | "identity_hydrated"
  | "runtime_hydrated"
  | "workspace_hydrated"
  | "hydration_frozen";

export const HYDRATION_PHASES = [
  "bootstrap_ready_validated",
  "identity_hydrated",
  "runtime_hydrated",
  "workspace_hydrated",
  "hydration_frozen",
] as const satisfies readonly HydrationPhase[];

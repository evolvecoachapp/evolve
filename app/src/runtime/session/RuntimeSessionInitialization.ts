/**
 * Ordered phases recorded when runtime session completes successfully.
 */
export type RuntimeSessionPhase =
  | "bootstrap_completed"
  | "hydration_completed"
  | "dashboard_restore_completed"
  | "session_frozen";

export const RUNTIME_SESSION_PHASES = [
  "bootstrap_completed",
  "hydration_completed",
  "dashboard_restore_completed",
  "session_frozen",
] as const satisfies readonly RuntimeSessionPhase[];

/**
 * Ordered phases recorded when runtime write-through completes successfully.
 */
export type RuntimeWriteThroughPhase =
  | "bootstrap_ready_validated"
  | "identity_persisted"
  | "runtime_persisted"
  | "workspace_persisted"
  | "write_through_frozen";

export const RUNTIME_WRITE_THROUGH_PHASES = [
  "bootstrap_ready_validated",
  "identity_persisted",
  "runtime_persisted",
  "workspace_persisted",
  "write_through_frozen",
] as const satisfies readonly RuntimeWriteThroughPhase[];

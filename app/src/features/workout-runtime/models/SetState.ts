/**
 * Per-set lifecycle within an exercise runtime.
 */
export type SetState =
  | "Pending"
  | "Active"
  | "Completed"
  | "Skipped";

export const SET_STATES = Object.freeze([
  "Pending",
  "Active",
  "Completed",
  "Skipped",
] as const satisfies readonly SetState[]);

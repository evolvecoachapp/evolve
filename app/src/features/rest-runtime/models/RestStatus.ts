/**
 * Derived timing status for a rest period (distinct from lifecycle RestState).
 */
export type RestStatus =
  | "Idle"
  | "Counting"
  | "Paused"
  | "OnTarget"
  | "Overtime"
  | "Finished"
  | "Cancelled";

export const REST_STATUSES = Object.freeze([
  "Idle",
  "Counting",
  "Paused",
  "OnTarget",
  "Overtime",
  "Finished",
  "Cancelled",
] as const satisfies readonly RestStatus[]);

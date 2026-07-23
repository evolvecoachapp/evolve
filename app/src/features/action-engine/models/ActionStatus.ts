/**
 * Immutable planning status for actions / steps / plans.
 * Plan-time only — does not reflect real runtime execution.
 */
export type ActionStatus =
  | "proposed"
  | "planned"
  | "ready"
  | "blocked"
  | "skipped"
  | "cancelled";

export const ActionStatuses = Object.freeze({
  PROPOSED: "proposed" as const,
  PLANNED: "planned" as const,
  READY: "ready" as const,
  BLOCKED: "blocked" as const,
  SKIPPED: "skipped" as const,
  CANCELLED: "cancelled" as const,
});

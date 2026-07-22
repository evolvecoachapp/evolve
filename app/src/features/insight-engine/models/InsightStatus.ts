/**
 * Lifecycle status of a generated insight within a snapshot.
 */
export const InsightStatuses = {
  ACTIVE: "active",
  SUPERSEDED: "superseded",
  INVALID: "invalid",
} as const;

export type InsightStatus =
  (typeof InsightStatuses)[keyof typeof InsightStatuses];

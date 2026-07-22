/**
 * Expected directional trend for a progression dimension across weeks.
 * Descriptive only — never derived from athlete feedback.
 */
export type ProgressionTrend = "increasing" | "stable" | "decreasing";

export const PROGRESSION_TRENDS = Object.freeze([
  "increasing",
  "stable",
  "decreasing",
] as const satisfies readonly ProgressionTrend[]);

/**
 * Severity of a domain decision's impact on the generated workout.
 */
export type DecisionSeverity = "info" | "low" | "medium" | "high" | "critical";

export const DECISION_SEVERITIES = Object.freeze([
  "info",
  "low",
  "medium",
  "high",
  "critical",
] as const satisfies readonly DecisionSeverity[]);

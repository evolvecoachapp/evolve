/**
 * Observational severity — not a recommendation urgency signal.
 */
export const InsightSeverities = {
  INFO: "info",
  NOTABLE: "notable",
  ELEVATED: "elevated",
  CRITICAL: "critical",
} as const;

export type InsightSeverity =
  (typeof InsightSeverities)[keyof typeof InsightSeverities];

export const INSIGHT_SEVERITY_ORDER: readonly InsightSeverity[] = [
  InsightSeverities.INFO,
  InsightSeverities.NOTABLE,
  InsightSeverities.ELEVATED,
  InsightSeverities.CRITICAL,
];

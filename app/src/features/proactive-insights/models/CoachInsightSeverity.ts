/**
 * Deterministic insight severity levels (Sprint 25.5).
 * Severity is computed from evidence counts — never invented.
 */
export const CoachInsightSeverities = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
  CRITICAL: "CRITICAL",
} as const;

export type CoachInsightSeverity =
  (typeof CoachInsightSeverities)[keyof typeof CoachInsightSeverities];

export const ALL_COACH_INSIGHT_SEVERITIES: readonly CoachInsightSeverity[] =
  Object.freeze(Object.values(CoachInsightSeverities));

/** Ordinal for deterministic prioritization (lower = more severe). */
export const COACH_INSIGHT_SEVERITY_ORDINAL: Readonly<
  Record<CoachInsightSeverity, number>
> = Object.freeze({
  CRITICAL: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
});

/**
 * Map evidence count → severity. Thresholds are fixed and deterministic.
 * count ≥ 5 → CRITICAL, ≥ 3 → HIGH, ≥ 2 → MEDIUM, else LOW.
 */
export function severityForEvidenceCount(count: number): CoachInsightSeverity {
  const n = Math.max(0, Math.floor(count));
  if (n >= 5) return CoachInsightSeverities.CRITICAL;
  if (n >= 3) return CoachInsightSeverities.HIGH;
  if (n >= 2) return CoachInsightSeverities.MEDIUM;
  return CoachInsightSeverities.LOW;
}

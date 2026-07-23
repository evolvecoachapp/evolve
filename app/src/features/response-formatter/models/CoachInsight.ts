/**
 * Immutable coach insight extracted from provider output.
 */
export interface CoachInsight {
  readonly id: string;
  readonly text: string;
  readonly kind: CoachInsightKind;
}

export type CoachInsightKind =
  | "observation"
  | "pattern"
  | "reasoning"
  | "summary"
  | "unknown";

export const CoachInsightKinds = Object.freeze({
  OBSERVATION: "observation" as const,
  PATTERN: "pattern" as const,
  REASONING: "reasoning" as const,
  SUMMARY: "summary" as const,
  UNKNOWN: "unknown" as const,
});

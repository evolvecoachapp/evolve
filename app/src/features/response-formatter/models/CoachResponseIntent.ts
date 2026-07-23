/**
 * Provider-independent response intent classification.
 */
export type CoachResponseIntent =
  | "informational"
  | "recommendation"
  | "warning"
  | "actionable"
  | "question"
  | "mixed"
  | "unknown";

export const CoachResponseIntents = Object.freeze({
  INFORMATIONAL: "informational" as const,
  RECOMMENDATION: "recommendation" as const,
  WARNING: "warning" as const,
  ACTIONABLE: "actionable" as const,
  QUESTION: "question" as const,
  MIXED: "mixed" as const,
  UNKNOWN: "unknown" as const,
});

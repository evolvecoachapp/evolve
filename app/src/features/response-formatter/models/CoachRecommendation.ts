/**
 * Immutable coach recommendation.
 */
export interface CoachRecommendation {
  readonly id: string;
  readonly text: string;
  readonly category: CoachRecommendationCategory;
  readonly priority: number;
  readonly severity: CoachSeverity;
}

export type CoachRecommendationCategory =
  | "training"
  | "recovery"
  | "nutrition"
  | "technique"
  | "general"
  | "unknown";

export type CoachSeverity =
  | "info"
  | "low"
  | "medium"
  | "high"
  | "critical";

export const CoachRecommendationCategories = Object.freeze({
  TRAINING: "training" as const,
  RECOVERY: "recovery" as const,
  NUTRITION: "nutrition" as const,
  TECHNIQUE: "technique" as const,
  GENERAL: "general" as const,
  UNKNOWN: "unknown" as const,
});

export const CoachSeverities = Object.freeze({
  INFO: "info" as const,
  LOW: "low" as const,
  MEDIUM: "medium" as const,
  HIGH: "high" as const,
  CRITICAL: "critical" as const,
});

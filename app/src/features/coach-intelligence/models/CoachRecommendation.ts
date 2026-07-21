/** Machine-readable recommendation codes — no natural language. */
export type RecommendationCode =
  | "increase_volume"
  | "reduce_volume"
  | "maintain_consistency"
  | "return_to_training"
  | "deload"
  | "progress_load"
  | "vary_exercises";

export type RecommendationPriority = "low" | "medium" | "high";

/**
 * Structured coaching recommendation derived from insights and risk flags.
 */
export interface CoachRecommendation {
  readonly code: RecommendationCode;
  readonly priority: RecommendationPriority;
  /** Insight ids that motivated this recommendation. */
  readonly relatedInsightIds: readonly string[];
}

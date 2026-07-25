export const RecommendationConfidenceLevels = {
  HIGH: "high",
  MEDIUM: "medium",
  LOW: "low",
  UNKNOWN: "unknown",
} as const;

export type RecommendationConfidenceLevel =
  (typeof RecommendationConfidenceLevels)[keyof typeof RecommendationConfidenceLevels];

export interface RecommendationConfidence {
  readonly level: RecommendationConfidenceLevel;
  readonly score: number;
  readonly notes: readonly string[];
}

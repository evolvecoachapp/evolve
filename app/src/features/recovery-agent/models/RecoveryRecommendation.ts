export const RecoveryRecommendationCategories = Object.freeze({
  SLEEP: "sleep" as const,
  STRESS: "stress" as const,
  FATIGUE: "fatigue" as const,
  READINESS: "readiness" as const,
  DELOAD: "deload" as const,
  WELLNESS: "wellness" as const,
  PROTOCOL: "protocol" as const,
  EDUCATION: "education" as const,
  GENERAL: "general" as const,
});

export type RecoveryRecommendationCategory =
  (typeof RecoveryRecommendationCategories)[keyof typeof RecoveryRecommendationCategories];

export interface RecoveryRecommendation {
  readonly id: string;
  readonly category: RecoveryRecommendationCategory;
  readonly title: string;
  readonly detail: string;
  readonly priority: number;
}

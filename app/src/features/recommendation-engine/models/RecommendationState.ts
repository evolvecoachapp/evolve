import type { CoachingRecommendation } from "./CoachingRecommendation";
import type { RecommendationPackage } from "./RecommendationPackage";

export const RecommendationSessionStatuses = {
  IDLE: "idle",
  BUILDING: "building",
  PRIORITIZING: "prioritizing",
  PACKAGING: "packaging",
  READY: "ready",
  INVALID: "invalid",
} as const;

export type RecommendationSessionStatus =
  (typeof RecommendationSessionStatuses)[keyof typeof RecommendationSessionStatuses];

export interface RecommendationState {
  readonly status: RecommendationSessionStatus;
  readonly package: RecommendationPackage | null;
  readonly recommendations: readonly CoachingRecommendation[];
  readonly updatedAt: string;
}

import type { RecommendationPackage } from "../models/RecommendationPackage";
import type { CoachingRecommendation } from "../models/CoachingRecommendation";

export function selectPackageRecommendations(
  pkg: RecommendationPackage | null,
): readonly CoachingRecommendation[] {
  return pkg?.recommendations ?? Object.freeze([]);
}

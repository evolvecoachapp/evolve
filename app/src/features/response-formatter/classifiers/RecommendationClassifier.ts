import type { CoachRecommendationCategory } from "../models/CoachRecommendation";
import { CoachRecommendationCategories } from "../models/CoachRecommendation";

/**
 * Provider-independent recommendation category classifier.
 */
export class RecommendationClassifier {
  classify(text: string): CoachRecommendationCategory {
    const lower = text.toLowerCase();
    if (
      lower.includes("protein") ||
      lower.includes("calorie") ||
      lower.includes("nutrition") ||
      lower.includes("meal") ||
      lower.includes("hydrate")
    ) {
      return CoachRecommendationCategories.NUTRITION;
    }
    if (
      lower.includes("sleep") ||
      lower.includes("recover") ||
      lower.includes("rest") ||
      lower.includes("mobility")
    ) {
      return CoachRecommendationCategories.RECOVERY;
    }
    if (
      lower.includes("form") ||
      lower.includes("technique") ||
      lower.includes("cue") ||
      lower.includes("brace")
    ) {
      return CoachRecommendationCategories.TECHNIQUE;
    }
    if (
      lower.includes("set") ||
      lower.includes("rep") ||
      lower.includes("lift") ||
      lower.includes("train") ||
      lower.includes("workout") ||
      lower.includes("volume") ||
      lower.includes("intensity")
    ) {
      return CoachRecommendationCategories.TRAINING;
    }
    if (!text.trim()) {
      return CoachRecommendationCategories.UNKNOWN;
    }
    return CoachRecommendationCategories.GENERAL;
  }
}

export const recommendationClassifier = new RecommendationClassifier();

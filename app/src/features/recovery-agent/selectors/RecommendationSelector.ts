import type { RecoveryPlan } from "../models/RecoveryPlan";
import type { RecoveryRecommendationCategory } from "../models/RecoveryRecommendation";
import { RecoveryRecommendationCategories } from "../models/RecoveryRecommendation";

export class RecommendationSelector {
  selectCategories(plan: RecoveryPlan): readonly RecoveryRecommendationCategory[] {
    const cats: RecoveryRecommendationCategory[] = [
      RecoveryRecommendationCategories.PROTOCOL,
      RecoveryRecommendationCategories.GENERAL,
    ];
    if (plan.assessment.sleep.quality < 60) {
      cats.push(RecoveryRecommendationCategories.SLEEP);
    }
    if (plan.assessment.stress.level >= 60) {
      cats.push(RecoveryRecommendationCategories.STRESS);
    }
    if (plan.assessment.fatigue.level >= 60) {
      cats.push(RecoveryRecommendationCategories.FATIGUE);
    }
    if (plan.assessment.readiness.score < 55) {
      cats.push(RecoveryRecommendationCategories.READINESS);
    }
    if (plan.deloadRecommendation.recommended) {
      cats.push(RecoveryRecommendationCategories.DELOAD);
    }
    cats.push(RecoveryRecommendationCategories.WELLNESS);
    cats.push(RecoveryRecommendationCategories.EDUCATION);
    return Object.freeze([...new Set(cats)]);
  }
}

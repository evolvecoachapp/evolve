import type { RecoveryDecision } from "../models/RecoveryDecision";
import type { RecoveryPlan } from "../models/RecoveryPlan";
import type { RecoveryRecommendation } from "../models/RecoveryRecommendation";
import { RecoveryRecommendationCategories } from "../models/RecoveryRecommendation";
import { RecommendationSelector } from "../selectors/RecommendationSelector";
import { freezeRecommendation } from "../utils/FreezeRecoveryState";

export class RecoveryRecommendationBuilder {
  constructor(
    private readonly recommendationSelector = new RecommendationSelector(),
  ) {}

  build(input: {
    readonly decision: RecoveryDecision;
    readonly plan: RecoveryPlan | null;
  }): readonly RecoveryRecommendation[] {
    if (!input.plan) return Object.freeze([]);
    const categories = this.recommendationSelector.selectCategories(input.plan);
    const recs: RecoveryRecommendation[] = [];
    let i = 0;
    for (const category of categories) {
      i += 1;
      const title =
        category === RecoveryRecommendationCategories.DELOAD
          ? "Consider a deload"
          : category === RecoveryRecommendationCategories.SLEEP
            ? "Improve sleep"
            : category === RecoveryRecommendationCategories.STRESS
              ? "Reduce stress"
              : category === RecoveryRecommendationCategories.FATIGUE
                ? "Manage fatigue"
                : category === RecoveryRecommendationCategories.READINESS
                  ? "Protect readiness"
                  : category === RecoveryRecommendationCategories.PROTOCOL
                    ? `Follow ${input.plan.protocolHint} protocol`
                    : category === RecoveryRecommendationCategories.EDUCATION
                      ? "Recovery education"
                      : "Recovery guidance";
      const detail =
        category === RecoveryRecommendationCategories.PROTOCOL
          ? `Target recovery score ${input.plan.recoveryScoreTarget} with ${input.plan.protocolHint}.`
          : category === RecoveryRecommendationCategories.DELOAD
            ? input.plan.deloadRecommendation.rationale
            : `${title} based on current assessment.`;
      recs.push(
        freezeRecommendation({
          id: `rrec:${input.decision.id}:${i}`,
          category,
          title,
          detail,
          priority: 100 - i,
        }),
      );
    }
    return Object.freeze(recs);
  }
}

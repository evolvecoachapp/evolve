import type { NutritionDecision } from "../models/NutritionDecision";
import type { NutritionPlan } from "../models/NutritionPlan";
import type { NutritionRecommendation } from "../models/NutritionRecommendation";
import { NutritionRecommendationCategories } from "../models/NutritionRecommendation";
import { labelFromScore } from "../models/NutritionConfidence";
import { freezeRecommendation } from "../utils/FreezeNutritionState";
import { formatMacroLine } from "../utils/FormattingHelpers";

export class RecommendationBuilder {
  build(input: {
    readonly decision: NutritionDecision;
    readonly plan: NutritionPlan;
  }): readonly NutritionRecommendation[] {
    const conf = Object.freeze({
      score: input.decision.confidence.score,
      label: labelFromScore(input.decision.confidence.score),
      rationale: null,
    });
    const macros = input.plan.macroTargets;
    return Object.freeze([
      freezeRecommendation({
        id: `nrec:${input.plan.id}:calories`,
        category: NutritionRecommendationCategories.CALORIES,
        title: "Calorie target",
        detail: `Aim for ~${input.plan.calorieTargets.targetCalories} kcal/day.`,
        priority: 100,
        confidence: conf,
        relatedPlanId: input.plan.id,
      }),
      freezeRecommendation({
        id: `nrec:${input.plan.id}:macros`,
        category: NutritionRecommendationCategories.MACROS,
        title: "Macro distribution",
        detail: formatMacroLine(macros),
        priority: 90,
        confidence: conf,
        relatedPlanId: input.plan.id,
      }),
      freezeRecommendation({
        id: `nrec:${input.plan.id}:meals`,
        category: NutritionRecommendationCategories.MEALS,
        title: "Meal structure",
        detail: `${input.plan.mealDistribution.mealsPerDay} meals: ${input.plan.mealDistribution.distribution.join(", ")}.`,
        priority: 70,
        confidence: conf,
        relatedPlanId: input.plan.id,
      }),
      freezeRecommendation({
        id: `nrec:${input.plan.id}:hydration`,
        category: NutritionRecommendationCategories.HYDRATION,
        title: "Hydration",
        detail: `Target ~${input.plan.hydrationPlan.litersPerDay} L/day.`,
        priority: 60,
        confidence: conf,
        relatedPlanId: input.plan.id,
      }),
    ]);
  }
}

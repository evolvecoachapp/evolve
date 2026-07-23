import { EMPTY_NUTRITION_AGENT_METADATA } from "../models/NutritionMetadata";
import type { NutritionAgentResult } from "../models/NutritionAgentResult";
import type { NutritionDomainInvocation } from "../models/NutritionDomainInvocation";
import type { NutritionEvaluation } from "../models/NutritionEvaluation";
import type { NutritionPlan } from "../models/NutritionPlan";
import type { NutritionPlanSummary } from "../models/NutritionPlanSummary";
import type { NutritionValidation } from "../models/NutritionValidation";
import {
  freezeEvaluation,
  freezePlanSummary,
} from "../utils/FreezeNutritionState";

/**
 * Builds immutable nutrition result summaries / evaluations.
 * No domain calculations — reshapes already-produced agent artifacts.
 */
export class NutritionResultBuilder {
  buildPlanSummary(plan: NutritionPlan): NutritionPlanSummary {
    return freezePlanSummary({
      planId: plan.id,
      goal: plan.goal,
      phaseHint: plan.phaseHint,
      targetCalories: plan.calorieTargets.targetCalories,
      proteinG: plan.macroTargets.proteinG,
      carbsG: plan.macroTargets.carbsG,
      fatG: plan.macroTargets.fatG,
      mealCount: plan.mealDistribution.mealsPerDay,
      summary: `${plan.goal} plan @ ${plan.calorieTargets.targetCalories} kcal`,
      createdAt: plan.createdAt,
    });
  }

  buildEvaluation(input: {
    readonly id: string;
    readonly planId?: string | null;
    readonly requestId?: string | null;
    readonly validation: NutritionValidation;
    readonly findings?: readonly string[];
    readonly score?: number | null;
    readonly capability?: NutritionEvaluation["capability"];
    readonly evaluatedAt: string;
  }): NutritionEvaluation {
    return freezeEvaluation({
      id: input.id,
      planId: input.planId ?? null,
      requestId: input.requestId ?? null,
      capability: input.capability ?? null,
      validation: input.validation,
      findings: Object.freeze([...(input.findings ?? [])]),
      score: input.score ?? null,
      metadata: EMPTY_NUTRITION_AGENT_METADATA,
      evaluatedAt: input.evaluatedAt,
    });
  }

  withDomainInvocations(
    result: NutritionAgentResult,
    domainInvocations: readonly NutritionDomainInvocation[],
  ): NutritionAgentResult {
    return Object.freeze({
      ...result,
      domainInvocations: Object.freeze([...domainInvocations]),
    });
  }
}

export function buildNutritionPlanSummary(
  plan: NutritionPlan,
): NutritionPlanSummary {
  return new NutritionResultBuilder().buildPlanSummary(plan);
}

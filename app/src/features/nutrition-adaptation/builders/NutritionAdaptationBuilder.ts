import type { CalorieAdjustment } from "../models/CalorieAdjustment";
import type { CarbohydrateAdjustment } from "../models/CarbohydrateAdjustment";
import type { DietBreakAdjustment } from "../models/DietBreakAdjustment";
import type { FatAdjustment } from "../models/FatAdjustment";
import type { FiberAdjustment } from "../models/FiberAdjustment";
import type { HydrationAdjustment } from "../models/HydrationAdjustment";
import type { MacroDistributionAdjustment } from "../models/MacroDistributionAdjustment";
import type { MealAdjustment } from "../models/MealAdjustment";
import type { MealInsertion } from "../models/MealInsertion";
import type { MealRemoval } from "../models/MealRemoval";
import type { MealReplacement } from "../models/MealReplacement";
import type { MealTimingAdjustment } from "../models/MealTimingAdjustment";
import type { NutritionAdaptation } from "../models/NutritionAdaptation";
import type { NutritionAdjustment } from "../models/NutritionAdjustment";
import { EMPTY_NUTRITION_METADATA } from "../models/NutritionMetadata";
import type { NutritionModification } from "../models/NutritionModification";
import { NutritionModificationKinds } from "../models/NutritionModification";
import type { NutritionReplacement } from "../models/NutritionReplacement";
import type { ProteinAdjustment } from "../models/ProteinAdjustment";
import type { RefeedAdjustment } from "../models/RefeedAdjustment";
import type { SupplementAdjustment } from "../models/SupplementAdjustment";
import type { WeeklyAdjustment } from "../models/WeeklyAdjustment";
import { freezeAdaptation, freezeModification } from "../utils/FreezeNutritionAdaptation";

export function buildNutritionAdaptation(input: {
  readonly id: string;
  readonly athleteId: string;
  readonly planId: string;
  readonly contextId: string;
  readonly decisionKeys: readonly string[];
  readonly signalKeys: readonly string[];
  readonly mealAdjustments?: readonly MealAdjustment[];
  readonly calorieAdjustments?: readonly CalorieAdjustment[];
  readonly proteinAdjustments?: readonly ProteinAdjustment[];
  readonly carbohydrateAdjustments?: readonly CarbohydrateAdjustment[];
  readonly fatAdjustments?: readonly FatAdjustment[];
  readonly fiberAdjustments?: readonly FiberAdjustment[];
  readonly hydrationAdjustments?: readonly HydrationAdjustment[];
  readonly mealTimingAdjustments?: readonly MealTimingAdjustment[];
  readonly supplementAdjustments?: readonly SupplementAdjustment[];
  readonly refeedAdjustments?: readonly RefeedAdjustment[];
  readonly dietBreakAdjustments?: readonly DietBreakAdjustment[];
  readonly macroDistributionAdjustments?: readonly MacroDistributionAdjustment[];
  readonly weeklyAdjustments?: readonly WeeklyAdjustment[];
  readonly mealReplacements?: readonly MealReplacement[];
  readonly mealRemovals?: readonly MealRemoval[];
  readonly mealInsertions?: readonly MealInsertion[];
  readonly at: string;
}): NutritionAdaptation {
  const mealAdjustments = Object.freeze([...(input.mealAdjustments ?? [])]);
  const calorieAdjustments = Object.freeze([...(input.calorieAdjustments ?? [])]);
  const hydrationAdjustments = Object.freeze([...(input.hydrationAdjustments ?? [])]);
  const mealTimingAdjustments = Object.freeze([...(input.mealTimingAdjustments ?? [])]);
  const supplementAdjustments = Object.freeze([...(input.supplementAdjustments ?? [])]);
  const refeedAdjustments = Object.freeze([...(input.refeedAdjustments ?? [])]);
  const dietBreakAdjustments = Object.freeze([...(input.dietBreakAdjustments ?? [])]);
  const macroDistributionAdjustments = Object.freeze([...(input.macroDistributionAdjustments ?? [])]);
  const weeklyAdjustments = Object.freeze([...(input.weeklyAdjustments ?? [])]);

  const modifications: NutritionModification[] = [];
  for (const adj of [
    ...mealAdjustments,
    ...calorieAdjustments,
    ...hydrationAdjustments,
    ...mealTimingAdjustments,
    ...supplementAdjustments,
    ...refeedAdjustments,
    ...dietBreakAdjustments,
    ...macroDistributionAdjustments,
    ...weeklyAdjustments,
  ]) {
    modifications.push(
      freezeModification({
        id: `mod:${adj.id}`,
        kind: NutritionModificationKinds.ADJUSTMENT,
        targetKey: adj.targetKey,
        sourceDecisionKeys: adj.sourceDecisionKeys,
        planStepKeys: adj.planStepKeys,
        metadata: EMPTY_NUTRITION_METADATA,
        createdAt: input.at,
      }),
    );
  }

  const adjustments: readonly NutritionAdjustment[] = Object.freeze(
    modifications.map((m) =>
      Object.freeze({
        id: `na:${m.id}`,
        targetKey: m.targetKey,
        adjustmentKey: m.id,
        sourceDecisionKeys: m.sourceDecisionKeys,
        metadata: EMPTY_NUTRITION_METADATA,
        createdAt: input.at,
      }),
    ),
  );

  const replacements: readonly NutritionReplacement[] = Object.freeze([]);

  return freezeAdaptation({
    id: input.id,
    athleteId: input.athleteId,
    planId: input.planId,
    contextId: input.contextId,
    decisionKeys: Object.freeze([...input.decisionKeys]),
    signalKeys: Object.freeze([...input.signalKeys]),
    modifications: Object.freeze(modifications),
    adjustments,
    replacements,
    mealAdjustments,
    mealReplacements: Object.freeze([...(input.mealReplacements ?? [])]),
    mealRemovals: Object.freeze([...(input.mealRemovals ?? [])]),
    mealInsertions: Object.freeze([...(input.mealInsertions ?? [])]),
    calorieAdjustments,
    proteinAdjustments: Object.freeze([...(input.proteinAdjustments ?? [])]),
    carbohydrateAdjustments: Object.freeze([...(input.carbohydrateAdjustments ?? [])]),
    fatAdjustments: Object.freeze([...(input.fatAdjustments ?? [])]),
    fiberAdjustments: Object.freeze([...(input.fiberAdjustments ?? [])]),
    hydrationAdjustments,
    mealTimingAdjustments,
    supplementAdjustments,
    refeedAdjustments,
    dietBreakAdjustments,
    macroDistributionAdjustments,
    weeklyAdjustments,
    metadata: EMPTY_NUTRITION_METADATA,
    createdAt: input.at,
  });
}

import type { NutritionAdaptation } from "../models/NutritionAdaptation";
import type { NutritionStatistics } from "../models/NutritionStatistics";

export function buildStatistics(adaptation: NutritionAdaptation | null): NutritionStatistics {
  if (!adaptation) {
    return Object.freeze({
      modificationCount: 0,
      adjustmentCount: 0,
      replacementCount: 0,
      decisionKeyCount: 0,
      mealKeyCount: 0,
      macroKeyCount: 0,
    });
  }
  return Object.freeze({
    modificationCount: adaptation.modifications.length,
    adjustmentCount:
      adaptation.adjustments.length +
      adaptation.mealAdjustments.length +
      adaptation.calorieAdjustments.length +
      adaptation.proteinAdjustments.length +
      adaptation.carbohydrateAdjustments.length +
      adaptation.fatAdjustments.length +
      adaptation.fiberAdjustments.length +
      adaptation.hydrationAdjustments.length +
      adaptation.mealTimingAdjustments.length +
      adaptation.supplementAdjustments.length +
      adaptation.refeedAdjustments.length +
      adaptation.dietBreakAdjustments.length +
      adaptation.macroDistributionAdjustments.length +
      adaptation.weeklyAdjustments.length,
    replacementCount:
      adaptation.replacements.length + adaptation.mealReplacements.length,
    decisionKeyCount: adaptation.decisionKeys.length,
    mealKeyCount: adaptation.mealAdjustments.length,
    macroKeyCount: adaptation.macroDistributionAdjustments.length,
  });
}

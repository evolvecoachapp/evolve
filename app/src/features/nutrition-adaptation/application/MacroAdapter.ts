import { EMPTY_NUTRITION_METADATA } from "../models/NutritionMetadata";
import type { MacroDistributionAdjustment } from "../models/MacroDistributionAdjustment";
import { freezeMacroDistributionAdjustment } from "../utils/FreezeNutritionAdaptation";

/** Deterministic key → modification mapping. NO nutrition generation. */
export function adaptMacro(input: {
  readonly id: string;
  readonly decisionKeys: readonly string[];
  readonly planStepKeys: readonly string[];
  readonly targetKeys: readonly string[];
  readonly at: string;
}): readonly MacroDistributionAdjustment[] {
  const out: MacroDistributionAdjustment[] = [];
  for (const key of input.decisionKeys) {
    if (
      !key.includes("macro") &&
      !key.includes("protein") &&
      !key.includes("carbohydrate") &&
      !key.includes("fat") &&
      !key.includes("fiber")
    ) {
      continue;
    }
    out.push(
      freezeMacroDistributionAdjustment({
        id: `adj:macro:${input.id}:${key}`,
        macroKey: `macro:${key}`,
        targetKey: `target:macro:${key}`,
        sourceDecisionKeys: Object.freeze([key]),
        planStepKeys: Object.freeze([...input.planStepKeys]),
        metadata: EMPTY_NUTRITION_METADATA,
        createdAt: input.at,
      }),
    );
  }
  for (const target of input.targetKeys) {
    if (!target.includes("macro")) continue;
    out.push(
      freezeMacroDistributionAdjustment({
        id: `adj:macro:${input.id}:${target}`,
        macroKey: target.replace(/^target:/, ""),
        targetKey: target,
        sourceDecisionKeys: Object.freeze([...input.decisionKeys]),
        planStepKeys: Object.freeze([...input.planStepKeys]),
        metadata: EMPTY_NUTRITION_METADATA,
        createdAt: input.at,
      }),
    );
  }
  return Object.freeze(out);

}

import type { NutritionPlan } from "../models/NutritionPlan";
import type { NutritionContext } from "../models/NutritionContext";
import type { NutritionValidation } from "../models/NutritionValidation";
import { NutritionValidationCodes } from "../models/NutritionValidation";
import { freezeValidation } from "../utils/FreezeNutritionState";

export function validateDietConsistency(
  plan: NutritionPlan,
): NutritionValidation {
  const issues = [];
  if (
    (plan.phaseHint === "cut" || plan.phaseHint === "contest") &&
    plan.calorieTargets.deficitOrSurplus > 0
  ) {
    issues.push(
      Object.freeze({
        code: NutritionValidationCodes.DIET_INCONSISTENCY,
        message: "Cut/contest phase should not be in surplus",
        path: "phaseHint",
      }),
    );
  }
  if (
    (plan.phaseHint === "bulk") &&
    plan.calorieTargets.deficitOrSurplus < 0
  ) {
    issues.push(
      Object.freeze({
        code: NutritionValidationCodes.DIET_INCONSISTENCY,
        message: "Bulk phase should not be in deficit",
        path: "phaseHint",
      }),
    );
  }
  return freezeValidation({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}

export function validateConstraints(
  context: NutritionContext,
  plan: NutritionPlan,
): NutritionValidation {
  const issues = [];
  if (
    context.constraints.minCalories != null &&
    plan.calorieTargets.targetCalories < context.constraints.minCalories
  ) {
    issues.push(
      Object.freeze({
        code: NutritionValidationCodes.CONSTRAINT_VIOLATION,
        message: "Below minimum calorie constraint",
        path: "constraints.minCalories",
      }),
    );
  }
  if (
    context.constraints.maxCalories != null &&
    plan.calorieTargets.targetCalories > context.constraints.maxCalories
  ) {
    issues.push(
      Object.freeze({
        code: NutritionValidationCodes.CONSTRAINT_VIOLATION,
        message: "Above maximum calorie constraint",
        path: "constraints.maxCalories",
      }),
    );
  }
  return freezeValidation({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}

export function validatePreferences(
  context: NutritionContext,
  plan: NutritionPlan,
): NutritionValidation {
  const issues = [];
  if (
    context.preferences.vegan &&
    plan.supplementPlan.items.some((i) => i.includes("whey"))
  ) {
    issues.push(
      Object.freeze({
        code: NutritionValidationCodes.PREFERENCE_CONFLICT,
        message: "Whey conflicts with vegan preference",
        path: "preferences.vegan",
      }),
    );
  }
  return freezeValidation({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}

export function validateSafety(plan: NutritionPlan): NutritionValidation {
  const issues = [];
  if (plan.calorieTargets.targetCalories < 1200) {
    issues.push(
      Object.freeze({
        code: NutritionValidationCodes.SAFETY_VIOLATION,
        message: "Calories below safety floor",
        path: "calorieTargets.targetCalories",
      }),
    );
  }
  return freezeValidation({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}

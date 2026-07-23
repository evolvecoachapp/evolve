import type { NutritionValidation } from "../models/NutritionValidation";
import { NutritionValidationCodes } from "../models/NutritionValidation";
import { freezeValidation } from "../utils/FreezeNutritionState";

export function validateProtein(proteinG: number): NutritionValidation {
  const issues = [];
  if (proteinG < 40 || proteinG > 400) {
    issues.push(
      Object.freeze({
        code: NutritionValidationCodes.INVALID_PROTEIN,
        message: `Protein out of range: ${proteinG}g`,
        path: "macroTargets.proteinG",
      }),
    );
  }
  return freezeValidation({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}

export function validateFat(fatG: number): NutritionValidation {
  const issues = [];
  if (fatG < 20 || fatG > 300) {
    issues.push(
      Object.freeze({
        code: NutritionValidationCodes.INVALID_FAT,
        message: `Fat out of range: ${fatG}g`,
        path: "macroTargets.fatG",
      }),
    );
  }
  return freezeValidation({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}

export function validateCarbohydrates(carbsG: number): NutritionValidation {
  const issues = [];
  if (carbsG < 20 || carbsG > 800) {
    issues.push(
      Object.freeze({
        code: NutritionValidationCodes.INVALID_CARBOHYDRATES,
        message: `Carbs out of range: ${carbsG}g`,
        path: "macroTargets.carbsG",
      }),
    );
  }
  return freezeValidation({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}

export function validateFiber(fiberG: number): NutritionValidation {
  const issues = [];
  if (fiberG < 10 || fiberG > 80) {
    issues.push(
      Object.freeze({
        code: NutritionValidationCodes.INVALID_FIBER,
        message: `Fiber out of range: ${fiberG}g`,
        path: "macroTargets.fiberG",
      }),
    );
  }
  return freezeValidation({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}

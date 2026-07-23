import type { NutritionExecutionContext } from "../models/NutritionExecutionContext";
import type {
  NutritionValidation,
  NutritionValidationIssue,
} from "../models/NutritionValidation";
import { NutritionValidationCodes } from "../models/NutritionValidation";
import { freezeValidation } from "../utils/FreezeNutritionState";

/**
 * Validates nutrition execution context shape (no tool execution here).
 */
export function validateExecutionContext(
  context: NutritionExecutionContext | null | undefined,
): NutritionValidation {
  const issues: NutritionValidationIssue[] = [];

  if (!context) {
    issues.push(
      Object.freeze({
        code: NutritionValidationCodes.MISSING_FIELD,
        message: "Execution context is required.",
        path: "executionContext",
      }),
    );
    return freezeValidation({ valid: false, issues: Object.freeze(issues) });
  }

  if (!context.id) {
    issues.push(
      Object.freeze({
        code: NutritionValidationCodes.MISSING_FIELD,
        message: "Execution context id is required.",
        path: "executionContext.id",
      }),
    );
  }

  if (!context.context) {
    issues.push(
      Object.freeze({
        code: NutritionValidationCodes.MISSING_FIELD,
        message: "Nested nutrition context is required.",
        path: "executionContext.context",
      }),
    );
  }

  if (!context.frozenAt) {
    issues.push(
      Object.freeze({
        code: NutritionValidationCodes.MISSING_FIELD,
        message: "Execution context frozenAt is required.",
        path: "executionContext.frozenAt",
      }),
    );
  }

  return freezeValidation({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}

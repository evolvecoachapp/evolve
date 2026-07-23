import type { NutritionRequest } from "../models/NutritionRequest";
import type {
  NutritionValidation,
  NutritionValidationIssue,
} from "../models/NutritionValidation";
import { NutritionValidationCodes } from "../models/NutritionValidation";
import { freezeValidation } from "../utils/FreezeNutritionState";

/**
 * Validates inbound nutrition request shape (orchestration integrity only).
 */
export function validateNutritionRequest(
  request: NutritionRequest | null | undefined,
): NutritionValidation {
  const issues: NutritionValidationIssue[] = [];

  if (!request) {
    issues.push(
      Object.freeze({
        code: NutritionValidationCodes.MISSING_FIELD,
        message: "Nutrition request is required.",
        path: "request",
      }),
    );
    return freezeValidation({ valid: false, issues: Object.freeze(issues) });
  }

  if (!request.id) {
    issues.push(
      Object.freeze({
        code: NutritionValidationCodes.MISSING_FIELD,
        message: "Request id is required.",
        path: "request.id",
      }),
    );
  }

  if (!request.message || request.message.trim().length === 0) {
    issues.push(
      Object.freeze({
        code: NutritionValidationCodes.MISSING_FIELD,
        message: "Request message is required.",
        path: "request.message",
      }),
    );
  }

  if (!request.createdAt) {
    issues.push(
      Object.freeze({
        code: NutritionValidationCodes.MISSING_FIELD,
        message: "Request createdAt is required.",
        path: "request.createdAt",
      }),
    );
  }

  return freezeValidation({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}

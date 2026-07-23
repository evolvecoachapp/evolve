import type { NutritionAgentResult } from "../models/NutritionAgentResult";
import type {
  NutritionValidation,
  NutritionValidationIssue,
} from "../models/NutritionValidation";
import { NutritionValidationCodes } from "../models/NutritionValidation";
import { freezeValidation } from "../utils/FreezeNutritionState";
import { validateGatewayInvocation } from "./validateGatewayInvocation";
import { validateNutritionRequest } from "./validateNutritionRequest";

/**
 * Validates NutritionAgentResult integrity (orchestration only).
 */
export function validateNutritionResult(
  result: NutritionAgentResult | null | undefined,
): NutritionValidation {
  const issues: NutritionValidationIssue[] = [];

  if (!result) {
    issues.push(
      Object.freeze({
        code: NutritionValidationCodes.MISSING_FIELD,
        message: "Nutrition agent result is required.",
        path: "result",
      }),
    );
    return freezeValidation({ valid: false, issues: Object.freeze(issues) });
  }

  const requestValidation = validateNutritionRequest(result.request);
  issues.push(...requestValidation.issues);

  if (!result.id) {
    issues.push(
      Object.freeze({
        code: NutritionValidationCodes.MISSING_FIELD,
        message: "Result id is required.",
        path: "result.id",
      }),
    );
  }

  if (!result.decision) {
    issues.push(
      Object.freeze({
        code: NutritionValidationCodes.MISSING_FIELD,
        message: "Result decision is required.",
        path: "result.decision",
      }),
    );
  }

  if (!Array.isArray(result.domainInvocations)) {
    issues.push(
      Object.freeze({
        code: NutritionValidationCodes.MISSING_FIELD,
        message: "Result domainInvocations must be an array.",
        path: "result.domainInvocations",
      }),
    );
  } else {
    const gatewayValidation = validateGatewayInvocation(
      result.domainInvocations,
    );
    issues.push(...gatewayValidation.issues);
  }

  if (!result.startedAt || !result.completedAt || !result.frozenAt) {
    issues.push(
      Object.freeze({
        code: NutritionValidationCodes.MISSING_FIELD,
        message: "Result timestamps are required.",
        path: "result.timestamps",
      }),
    );
  }

  return freezeValidation({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}

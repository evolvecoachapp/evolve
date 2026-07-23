import type { NutritionDomainInvocation } from "../models/NutritionDomainInvocation";
import { NutritionDomainInvocationStatuses } from "../models/NutritionDomainInvocation";
import type {
  NutritionValidation,
  NutritionValidationIssue,
} from "../models/NutritionValidation";
import { NutritionValidationCodes } from "../models/NutritionValidation";
import { freezeValidation } from "../utils/FreezeNutritionState";

/**
 * Validates gateway invocation records (orchestration integrity only).
 */
export function validateGatewayInvocation(
  invocations: readonly NutritionDomainInvocation[] | null | undefined,
): NutritionValidation {
  const issues: NutritionValidationIssue[] = [];

  if (!invocations) {
    issues.push(
      Object.freeze({
        code: NutritionValidationCodes.MISSING_FIELD,
        message: "Domain invocations are required.",
        path: "domainInvocations",
      }),
    );
    return freezeValidation({ valid: false, issues: Object.freeze(issues) });
  }

  const allowed = new Set<string>(
    Object.values(NutritionDomainInvocationStatuses),
  );

  for (const invocation of invocations) {
    if (!invocation.id) {
      issues.push(
        Object.freeze({
          code: NutritionValidationCodes.MISSING_FIELD,
          message: "Invocation id is required.",
          path: "domainInvocations.id",
        }),
      );
    }
    if (!invocation.capability) {
      issues.push(
        Object.freeze({
          code: NutritionValidationCodes.MISSING_FIELD,
          message: "Invocation capability is required.",
          path: "domainInvocations.capability",
        }),
      );
    }
    if (!allowed.has(invocation.status)) {
      issues.push(
        Object.freeze({
          code: NutritionValidationCodes.INCOMPATIBLE,
          message: `Invalid invocation status: ${String(invocation.status)}`,
          path: "domainInvocations.status",
        }),
      );
    }
    if (invocation.status === NutritionDomainInvocationStatuses.FAILED) {
      issues.push(
        Object.freeze({
          code: NutritionValidationCodes.INCOMPATIBLE,
          message: invocation.summary ?? "Domain invocation failed.",
          path: `domainInvocations.${invocation.capability}`,
        }),
      );
    }
  }

  return freezeValidation({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}

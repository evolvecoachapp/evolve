import type { AggregationContext } from "../models/AggregationContext";
import type { ExecutionResult } from "../models/ExecutionResult";
import type {
  CollaborationValidation,
  CollaborationValidationIssue,
} from "../models/CollaborationValidation";
import { CollaborationValidationCodes } from "../models/CollaborationValidation";
import { freezeValidation } from "../utils/FreezeCollaborationState";

/**
 * Validates aggregation inputs (context + ordered results).
 */
export function validateAggregationInputs(input: {
  readonly context?: AggregationContext | null;
  readonly results?: readonly ExecutionResult[] | null;
  readonly planId?: string | null;
}): CollaborationValidation {
  const issues: CollaborationValidationIssue[] = [];
  const context = input.context;
  const results = input.results ?? context?.results ?? null;

  if (!context && !results) {
    issues.push(
      Object.freeze({
        code: CollaborationValidationCodes.AGGREGATION_INVALID,
        message: "Aggregation context or results are required.",
        path: "aggregation",
      }),
    );
    return freezeValidation({ valid: false, issues: Object.freeze(issues) });
  }

  if (context) {
    if (!context.id) {
      issues.push(
        Object.freeze({
          code: CollaborationValidationCodes.MISSING_FIELD,
          message: "Aggregation context id is required.",
          path: "context.id",
        }),
      );
    }
    if (!context.planId) {
      issues.push(
        Object.freeze({
          code: CollaborationValidationCodes.MISSING_FIELD,
          message: "Aggregation context planId is required.",
          path: "context.planId",
        }),
      );
    }
    if (!context.plan) {
      issues.push(
        Object.freeze({
          code: CollaborationValidationCodes.AGGREGATION_INVALID,
          message: "Aggregation context plan is required.",
          path: "context.plan",
        }),
      );
    }
  }

  if (!results || results.length === 0) {
    issues.push(
      Object.freeze({
        code: CollaborationValidationCodes.AGGREGATION_INVALID,
        message: "Aggregation requires at least one execution result.",
        path: "results",
      }),
    );
  } else {
    const expectedPlanId = input.planId ?? context?.planId ?? null;
    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      if (!result.id) {
        issues.push(
          Object.freeze({
            code: CollaborationValidationCodes.MISSING_FIELD,
            message: "Execution result id is required.",
            path: `results[${i}].id`,
          }),
        );
      }
      if (!result.agentId) {
        issues.push(
          Object.freeze({
            code: CollaborationValidationCodes.INVALID_VALUE,
            message: "Execution result agentId is required.",
            path: `results[${i}].agentId`,
          }),
        );
      }
      if (expectedPlanId && result.planId !== expectedPlanId) {
        issues.push(
          Object.freeze({
            code: CollaborationValidationCodes.AGGREGATION_INVALID,
            message: `Result planId mismatch: ${result.planId}.`,
            path: `results[${i}].planId`,
          }),
        );
      }
    }
  }

  return freezeValidation({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}

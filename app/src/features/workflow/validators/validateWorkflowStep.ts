import type { WorkflowStep } from "../models/WorkflowStep";

/** Structured validation issue codes — never prose. */
export type WorkflowStepValidationCode =
  | "missing_id"
  | "missing_name"
  | "missing_tool_name"
  | "invalid_arguments"
  | "invalid_order"
  | "invalid_max_retries"
  | "invalid_condition";

/**
 * Validate a WorkflowStep structural integrity.
 */
export function validateWorkflowStep(
  step: WorkflowStep,
): readonly WorkflowStepValidationCode[] {
  const issues: WorkflowStepValidationCode[] = [];

  if (typeof step.id !== "string" || step.id.trim().length === 0) {
    issues.push("missing_id");
  }

  if (typeof step.name !== "string" || step.name.trim().length === 0) {
    issues.push("missing_name");
  }

  if (
    typeof step.toolName !== "string" ||
    step.toolName.trim().length === 0
  ) {
    issues.push("missing_tool_name");
  }

  if (!Array.isArray(step.arguments)) {
    issues.push("invalid_arguments");
  } else {
    for (const arg of step.arguments) {
      if (
        !arg ||
        typeof arg.name !== "string" ||
        arg.name.trim().length === 0
      ) {
        issues.push("invalid_arguments");
        break;
      }
    }
  }

  if (typeof step.order !== "number" || !Number.isFinite(step.order) || step.order < 0) {
    issues.push("invalid_order");
  }

  if (
    typeof step.maxRetries !== "number" ||
    !Number.isInteger(step.maxRetries) ||
    step.maxRetries < 0
  ) {
    issues.push("invalid_max_retries");
  }

  if (
    step.conditional &&
    step.conditionKey !== undefined &&
    (typeof step.conditionKey !== "string" ||
      step.conditionKey.trim().length === 0)
  ) {
    issues.push("invalid_condition");
  }

  return Object.freeze([...new Set(issues)]);
}

import type { ActionPlan } from "../models/ActionPlan";
import type { ActionValidationIssue } from "../models/ActionValidation";
import { ActionValidationCodes } from "../models/ActionValidation";
import { freezeValidationIssue } from "../utils/freezeActionPlan";

function issue(
  code: ActionValidationIssue["code"],
  message: string,
  path: string | null = null,
): ActionValidationIssue {
  return freezeValidationIssue({ code, message, path });
}

/**
 * Validate action arguments (structure only).
 */
export function validateArguments(
  plan: ActionPlan,
): readonly ActionValidationIssue[] {
  const issues: ActionValidationIssue[] = [];

  plan.steps.forEach((step, stepIndex) => {
    step.arguments.forEach((arg, argIndex) => {
      if (!arg.name.trim()) {
        issues.push(
          issue(
            ActionValidationCodes.INVALID_ARGUMENT,
            "Argument name is required",
            `steps[${stepIndex}].arguments[${argIndex}]`,
          ),
        );
      }
      if (arg.required && (arg.value === null || arg.value === "")) {
        issues.push(
          issue(
            ActionValidationCodes.INVALID_ARGUMENT,
            `Required argument "${arg.name}" has empty value`,
            `steps[${stepIndex}].arguments[${argIndex}]`,
          ),
        );
      }
    });
  });

  return Object.freeze(issues);
}

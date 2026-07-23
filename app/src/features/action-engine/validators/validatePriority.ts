import type { ActionPlan } from "../models/ActionPlan";
import type { ActionValidationIssue } from "../models/ActionValidation";
import { ActionValidationCodes } from "../models/ActionValidation";
import { freezeValidationIssue } from "../utils/freezeActionPlan";
import { isValidPriority } from "../utils/priorityHelpers";

function issue(
  code: ActionValidationIssue["code"],
  message: string,
  path: string | null = null,
): ActionValidationIssue {
  return freezeValidationIssue({ code, message, path });
}

/**
 * Validate priority values on plan and steps.
 */
export function validatePriority(
  plan: ActionPlan,
): readonly ActionValidationIssue[] {
  const issues: ActionValidationIssue[] = [];

  if (!isValidPriority(plan.priority)) {
    issues.push(
      issue(
        ActionValidationCodes.INVALID_PRIORITY,
        "Plan priority is invalid",
        "priority",
      ),
    );
  }

  plan.steps.forEach((step, index) => {
    if (!isValidPriority(step.priority)) {
      issues.push(
        issue(
          ActionValidationCodes.INVALID_PRIORITY,
          "Step priority is invalid",
          `steps[${index}].priority`,
        ),
      );
    }
  });

  return Object.freeze(issues);
}

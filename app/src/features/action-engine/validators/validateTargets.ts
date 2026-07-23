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
 * Validate action targets.
 */
export function validateTargets(
  plan: ActionPlan,
): readonly ActionValidationIssue[] {
  const issues: ActionValidationIssue[] = [];

  plan.steps.forEach((step, index) => {
    if (!step.target) return;
    if (!step.target.id.trim() || !step.target.label.trim()) {
      issues.push(
        issue(
          ActionValidationCodes.INVALID_TARGET,
          "Target requires id and label",
          `steps[${index}].target`,
        ),
      );
    }
  });

  return Object.freeze(issues);
}

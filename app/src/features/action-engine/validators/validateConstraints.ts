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
 * Validate constraints on plan and steps.
 */
export function validateConstraints(
  plan: ActionPlan,
): readonly ActionValidationIssue[] {
  const issues: ActionValidationIssue[] = [];

  const check = (
    constraints: typeof plan.constraints,
    pathPrefix: string,
  ) => {
    constraints.forEach((constraint, index) => {
      if (!constraint.id.trim() || !constraint.description.trim()) {
        issues.push(
          issue(
            ActionValidationCodes.INVALID_CONSTRAINT,
            "Constraint requires id and description",
            `${pathPrefix}[${index}]`,
          ),
        );
      }
    });
  };

  check(plan.constraints, "constraints");
  plan.steps.forEach((step, index) => {
    check(step.constraints, `steps[${index}].constraints`);
  });

  return Object.freeze(issues);
}

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
 * Validate core ActionPlan / ActionStep integrity (no execution).
 */
export function validateActionIntegrity(
  plan: ActionPlan,
): readonly ActionValidationIssue[] {
  const issues: ActionValidationIssue[] = [];

  if (!plan.id.trim()) {
    issues.push(
      issue(ActionValidationCodes.MISSING_ID, "Plan id is required", "id"),
    );
  }

  if (!plan.sourceResponseId.trim()) {
    issues.push(
      issue(
        ActionValidationCodes.MISSING_SOURCE,
        "sourceResponseId is required",
        "sourceResponseId",
      ),
    );
  }

  const seen = new Set<string>();
  plan.steps.forEach((step, index) => {
    if (!step.id.trim() || !step.label.trim()) {
      issues.push(
        issue(
          ActionValidationCodes.INVALID_STEP,
          "Step requires id and label",
          `steps[${index}]`,
        ),
      );
    }
    if (seen.has(step.id)) {
      issues.push(
        issue(
          ActionValidationCodes.DUPLICATE_STEP_ID,
          `Duplicate step id: ${step.id}`,
          `steps[${index}].id`,
        ),
      );
    }
    seen.add(step.id);

    if (step.planId !== plan.id) {
      issues.push(
        issue(
          ActionValidationCodes.PLAN_INCONSISTENCY,
          "Step planId must match plan id",
          `steps[${index}].planId`,
        ),
      );
    }
  });

  return Object.freeze(issues);
}

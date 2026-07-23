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
 * Validate plan-level consistency (timestamps, empty plans allowed with flag).
 */
export function validatePlanConsistency(
  plan: ActionPlan,
  options: { readonly allowEmptySteps?: boolean } = {},
): readonly ActionValidationIssue[] {
  const issues: ActionValidationIssue[] = [];
  const allowEmpty = options.allowEmptySteps ?? true;

  if (!plan.createdAt.trim() || !plan.frozenAt.trim()) {
    issues.push(
      issue(
        ActionValidationCodes.PLAN_INCONSISTENCY,
        "createdAt and frozenAt are required",
        "createdAt",
      ),
    );
  }

  if (!allowEmpty && plan.steps.length === 0) {
    issues.push(
      issue(
        ActionValidationCodes.EMPTY_STEPS,
        "Plan has no steps",
        "steps",
      ),
    );
  }

  const orders = plan.steps.map((s) => s.order);
  const sorted = [...orders].sort((a, b) => a - b);
  if (orders.join(",") !== sorted.join(",")) {
    // Non-fatal consistency note: steps should be ordered ascending
    issues.push(
      issue(
        ActionValidationCodes.PLAN_INCONSISTENCY,
        "Step order values are not ascending",
        "steps.order",
      ),
    );
  }

  return Object.freeze(issues);
}

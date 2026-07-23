import type { ToolExecutionPlan } from "../models/ToolExecutionPlan";
import type { ToolExecutionValidationIssue } from "../models/ToolExecutionValidation";
import { ToolExecutionValidationCodes } from "../models/ToolExecutionValidation";
import { freezeValidationIssue } from "../utils/freezeExecution";

function issue(
  code: string,
  message: string,
  path: string | null = null,
): ToolExecutionValidationIssue {
  return freezeValidationIssue({ code, message, path });
}

export function validateExecutionIntegrity(
  plan: ToolExecutionPlan,
): readonly ToolExecutionValidationIssue[] {
  const issues: ToolExecutionValidationIssue[] = [];
  if (!plan.id) {
    issues.push(
      issue(
        ToolExecutionValidationCodes.MISSING_PLAN_ID,
        "Execution plan id is required",
      ),
    );
  }
  if (!plan.actionPlanId) {
    issues.push(
      issue(
        ToolExecutionValidationCodes.MISSING_ACTION_PLAN_ID,
        "Action plan id is required",
      ),
    );
  }
  const seen = new Set<string>();
  for (const step of plan.steps) {
    if (!step.id) {
      issues.push(
        issue(
          ToolExecutionValidationCodes.MISSING_STEP_ID,
          "Execution step id is required",
        ),
      );
    } else if (seen.has(step.id)) {
      issues.push(
        issue(
          ToolExecutionValidationCodes.DUPLICATE_STEP_ID,
          `Duplicate step id ${step.id}`,
          `steps.${step.id}`,
        ),
      );
    } else {
      seen.add(step.id);
    }
    if (step.planId !== plan.id) {
      issues.push(
        issue(
          ToolExecutionValidationCodes.INTEGRITY_VIOLATION,
          `Step ${step.id} planId mismatch`,
          `steps.${step.id}.planId`,
        ),
      );
    }
  }
  return Object.freeze(issues);
}

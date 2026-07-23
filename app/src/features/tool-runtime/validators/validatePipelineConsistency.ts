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

export function validatePipelineConsistency(
  plan: ToolExecutionPlan,
): readonly ToolExecutionValidationIssue[] {
  const issues: ToolExecutionValidationIssue[] = [];
  if (plan.sourcePlan.id !== plan.actionPlanId) {
    issues.push(
      issue(
        ToolExecutionValidationCodes.PIPELINE_INCONSISTENT,
        "sourcePlan.id must match actionPlanId",
        "actionPlanId",
      ),
    );
  }
  const sourceIds = new Set(plan.sourcePlan.steps.map((s) => s.id));
  for (const step of plan.steps) {
    if (!sourceIds.has(step.actionStepId)) {
      issues.push(
        issue(
          ToolExecutionValidationCodes.PLAN_STEP_MISMATCH,
          `Execution step ${step.id} actionStepId not in source plan`,
          `steps.${step.id}.actionStepId`,
        ),
      );
    }
  }
  return Object.freeze(issues);
}

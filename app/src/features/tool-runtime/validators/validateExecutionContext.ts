import type { ToolExecutionContext } from "../models/ToolExecutionContext";
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

export function validateExecutionContext(
  context: ToolExecutionContext,
): readonly ToolExecutionValidationIssue[] {
  const issues: ToolExecutionValidationIssue[] = [];
  if (!context.id) {
    issues.push(
      issue(
        ToolExecutionValidationCodes.CONTEXT_INVALID,
        "Execution context id is required",
        "id",
      ),
    );
  }
  if (!context.planId) {
    issues.push(
      issue(
        ToolExecutionValidationCodes.CONTEXT_INVALID,
        "Execution context planId is required",
        "planId",
      ),
    );
  }
  if (!context.actionPlanId) {
    issues.push(
      issue(
        ToolExecutionValidationCodes.CONTEXT_INVALID,
        "Execution context actionPlanId is required",
        "actionPlanId",
      ),
    );
  }
  if (!context.requestedAt) {
    issues.push(
      issue(
        ToolExecutionValidationCodes.CONTEXT_INVALID,
        "Execution context requestedAt is required",
        "requestedAt",
      ),
    );
  }
  return Object.freeze(issues);
}

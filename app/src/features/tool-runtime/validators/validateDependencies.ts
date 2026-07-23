import type { ToolExecutionPlan } from "../models/ToolExecutionPlan";
import type { ToolExecutionValidationIssue } from "../models/ToolExecutionValidation";
import { ToolExecutionValidationCodes } from "../models/ToolExecutionValidation";
import {
  hasCircularDependencies,
  stepsMissingDependencies,
} from "../utils/dependencyHelpers";
import { freezeValidationIssue } from "../utils/freezeExecution";

function issue(
  code: string,
  message: string,
  path: string | null = null,
): ToolExecutionValidationIssue {
  return freezeValidationIssue({ code, message, path });
}

export function validateDependencies(
  plan: ToolExecutionPlan,
): readonly ToolExecutionValidationIssue[] {
  const issues: ToolExecutionValidationIssue[] = [];
  const missing = stepsMissingDependencies(plan.steps);
  for (const step of missing) {
    issues.push(
      issue(
        ToolExecutionValidationCodes.INVALID_DEPENDENCY,
        `Step ${step.id} references missing dependency`,
        `steps.${step.id}.dependsOn`,
      ),
    );
  }
  if (hasCircularDependencies(plan.steps)) {
    issues.push(
      issue(
        ToolExecutionValidationCodes.CIRCULAR_DEPENDENCY,
        "Circular dependency detected in execution plan",
      ),
    );
  }
  return Object.freeze(issues);
}

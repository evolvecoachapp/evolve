import type { AdapterResolver } from "../resolver/AdapterResolver";
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

export function validateAdapterAvailability(
  plan: ToolExecutionPlan,
  adapterResolver: AdapterResolver,
): readonly ToolExecutionValidationIssue[] {
  const issues: ToolExecutionValidationIssue[] = [];
  for (const step of plan.steps) {
    if (step.toolId == null) {
      issues.push(
        issue(
          ToolExecutionValidationCodes.TOOL_UNRESOLVED,
          `Step ${step.id} has no resolved tool`,
          `steps.${step.id}.toolId`,
        ),
      );
      continue;
    }
    if (!adapterResolver.isAvailable(step.toolId)) {
      issues.push(
        issue(
          ToolExecutionValidationCodes.ADAPTER_UNAVAILABLE,
          `No adapter available for tool ${step.toolId}`,
          `steps.${step.id}.adapterId`,
        ),
      );
    }
  }
  return Object.freeze(issues);
}

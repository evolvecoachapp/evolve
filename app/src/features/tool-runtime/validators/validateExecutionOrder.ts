import type { ToolExecutionPlan } from "../models/ToolExecutionPlan";
import type { ToolExecutionValidationIssue } from "../models/ToolExecutionValidation";
import { ToolExecutionValidationCodes } from "../models/ToolExecutionValidation";
import { topologicalStepOrder } from "../utils/dependencyHelpers";
import { freezeValidationIssue } from "../utils/freezeExecution";

function issue(
  code: string,
  message: string,
  path: string | null = null,
): ToolExecutionValidationIssue {
  return freezeValidationIssue({ code, message, path });
}

export function validateExecutionOrder(
  plan: ToolExecutionPlan,
): readonly ToolExecutionValidationIssue[] {
  const issues: ToolExecutionValidationIssue[] = [];
  const expected = topologicalStepOrder(plan.steps);
  if (
    plan.orderedStepIds.length !== expected.length ||
    plan.orderedStepIds.some((id, i) => id !== expected[i])
  ) {
    // Allow any total order that respects deps: verify every id present once
    const set = new Set(plan.orderedStepIds);
    if (
      set.size !== plan.steps.length ||
      plan.steps.some((s) => !set.has(s.id))
    ) {
      issues.push(
        issue(
          ToolExecutionValidationCodes.INVALID_ORDER,
          "orderedStepIds must include each step exactly once",
          "orderedStepIds",
        ),
      );
    }
  }

  const byId = new Map(plan.steps.map((s) => [s.id, s]));
  const seen = new Set<string>();
  for (const id of plan.orderedStepIds) {
    const step = byId.get(id);
    if (!step) continue;
    for (const dep of step.dependsOn) {
      if (!seen.has(dep)) {
        issues.push(
          issue(
            ToolExecutionValidationCodes.INVALID_ORDER,
            `Step ${id} appears before dependency ${dep}`,
            `orderedStepIds`,
          ),
        );
      }
    }
    seen.add(id);
  }

  return Object.freeze(issues);
}

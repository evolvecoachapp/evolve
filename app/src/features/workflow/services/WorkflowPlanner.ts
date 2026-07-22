import type { WorkflowContext } from "../models/WorkflowContext";
import type { WorkflowRequest } from "../models/WorkflowRequest";
import type { WorkflowStep } from "../models/WorkflowStep";
import { WorkflowError } from "../models/WorkflowError";
import type { AIWorkflow } from "../workflows/AIWorkflow";
import { validateWorkflowStep } from "../validators/validateWorkflowStep";

/**
 * Expands a workflow into ordered WorkflowSteps.
 *
 * Supports sequential plans with conditional / early-exit / retry hooks.
 * No parallel execution.
 */
export class WorkflowPlanner {
  /**
   * Call workflow.plan(), validate steps, sort by order, freeze.
   */
  expand(
    workflow: AIWorkflow,
    request: WorkflowRequest,
    context: WorkflowContext,
  ): readonly WorkflowStep[] {
    const planned = workflow.plan(request, context);

    if (!Array.isArray(planned)) {
      throw new WorkflowError(
        "invalid_plan",
        "Workflow plan must return an array of steps.",
        { workflowName: workflow.name() },
      );
    }

    const steps: WorkflowStep[] = [];
    for (const step of planned) {
      const issues = validateWorkflowStep(step);
      if (issues.length > 0) {
        throw new WorkflowError(
          "invalid_step",
          `Invalid workflow step: ${issues.join(",")}`,
          { workflowName: workflow.name(), stepId: step?.id, issues },
        );
      }
      steps.push(freezeStep(step));
    }

    steps.sort((left, right) => left.order - right.order);
    return Object.freeze(steps);
  }
}

function freezeStep(step: WorkflowStep): WorkflowStep {
  return Object.freeze({
    id: step.id,
    name: step.name,
    toolName: step.toolName,
    arguments: Object.freeze(
      step.arguments.map((arg) =>
        Object.freeze({ name: arg.name, value: arg.value }),
      ),
    ),
    order: step.order,
    conditional: step.conditional,
    conditionKey: step.conditionKey,
    earlyExitOnSuccess: step.earlyExitOnSuccess,
    maxRetries: step.maxRetries,
  });
}

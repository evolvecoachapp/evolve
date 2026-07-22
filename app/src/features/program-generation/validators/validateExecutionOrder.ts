import { PIPELINE_STEP_ORDER } from "../models/PipelineStepName";
import type { PipelineExecutionStep } from "../models/PipelineExecutionStep";

/**
 * Validate that recorded steps follow the canonical pipeline order.
 */
export function validateExecutionOrder(
  steps: readonly PipelineExecutionStep[],
): readonly string[] {
  const issues: string[] = [];
  const orderIndex = new Map(
    PIPELINE_STEP_ORDER.map((name, index) => [name, index]),
  );

  let previousIndex = -1;
  for (const step of steps) {
    const currentIndex = orderIndex.get(step.name);
    if (currentIndex === undefined) {
      issues.push(`unknown_step:${step.name}`);
      continue;
    }
    if (currentIndex < previousIndex) {
      issues.push(`out_of_order:${step.name}`);
    }
    previousIndex = currentIndex;
  }

  for (let i = 0; i < steps.length; i += 1) {
    if (steps[i].order !== i) {
      issues.push(`invalid_order_index:${steps[i].name}`);
    }
  }

  return Object.freeze([...new Set(issues)]);
}

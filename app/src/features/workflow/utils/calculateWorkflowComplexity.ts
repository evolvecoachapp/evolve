import type { WorkflowStep } from "../models/WorkflowStep";

/**
 * Estimate plan complexity from step count, conditionals, and retry hooks.
 * Pure metric — no formatting.
 */
export function calculateWorkflowComplexity(
  steps: readonly WorkflowStep[],
): number {
  let complexity = steps.length;

  for (const step of steps) {
    if (step.conditional) {
      complexity += 1;
    }
    if (step.earlyExitOnSuccess) {
      complexity += 1;
    }
    if (step.maxRetries > 0) {
      complexity += step.maxRetries;
    }
  }

  return complexity;
}

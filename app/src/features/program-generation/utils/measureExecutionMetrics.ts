import type { PipelineExecutionMetrics } from "../models/PipelineExecutionMetrics";
import type { PipelineExecutionStep } from "../models/PipelineExecutionStep";

/**
 * Measure structural pipeline metrics from steps and aggregate counts.
 * No timers — counts only.
 */
export function measureExecutionMetrics(options: {
  readonly steps: readonly PipelineExecutionStep[];
  readonly validationIssueCount: number;
  readonly explanationCount: number;
  readonly engineOutputCount: number;
}): PipelineExecutionMetrics {
  const { steps, validationIssueCount, explanationCount, engineOutputCount } =
    options;

  let succeededStepCount = 0;
  let failedStepCount = 0;
  let skippedStepCount = 0;

  for (const step of steps) {
    if (step.status === "succeeded") {
      succeededStepCount += 1;
    } else if (step.status === "failed") {
      failedStepCount += 1;
    } else if (step.status === "skipped") {
      skippedStepCount += 1;
    }
  }

  return Object.freeze({
    stepCount: steps.length,
    succeededStepCount,
    failedStepCount,
    skippedStepCount,
    validationIssueCount,
    explanationCount,
    engineOutputCount,
  });
}

import type { PipelineExecutionStatus } from "../models/PipelineExecutionStatus";
import type { PipelineExecutionStep } from "../models/PipelineExecutionStep";
import type { PipelineExecutionSummary } from "../models/PipelineExecutionSummary";
import type { PipelineStepName } from "../models/PipelineStepName";
import { measureExecutionMetrics } from "./measureExecutionMetrics";

/**
 * Aggregate an execution summary from recorded steps and validation issues.
 */
export function aggregateSummaries(options: {
  readonly generationId: string;
  readonly steps: readonly PipelineExecutionStep[];
  readonly validationIssues: readonly string[];
  readonly explanationCount: number;
  readonly engineOutputCount: number;
}): PipelineExecutionSummary {
  const {
    generationId,
    steps,
    validationIssues,
    explanationCount,
    engineOutputCount,
  } = options;

  const completedSteps: PipelineStepName[] = [];
  let failedStep: PipelineStepName | null = null;
  let status: PipelineExecutionStatus = "succeeded";

  for (const step of steps) {
    if (step.status === "succeeded") {
      completedSteps.push(step.name);
    } else if (step.status === "failed") {
      failedStep = step.name;
      status = "failed";
    }
  }

  const metrics = measureExecutionMetrics({
    steps,
    validationIssueCount: validationIssues.length,
    explanationCount,
    engineOutputCount,
  });

  return Object.freeze({
    generationId,
    status,
    completedSteps: Object.freeze([...completedSteps]),
    failedStep,
    metrics,
    validationIssues: Object.freeze([...validationIssues]),
  });
}

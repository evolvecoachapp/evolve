import type { PipelineExecutionMetrics } from "./PipelineExecutionMetrics";
import type { PipelineExecutionStatus } from "./PipelineExecutionStatus";
import type { PipelineStepName } from "./PipelineStepName";

/**
 * Aggregated view of a completed (or failed) pipeline run.
 */
export interface PipelineExecutionSummary {
  readonly generationId: string;
  readonly status: PipelineExecutionStatus;
  readonly completedSteps: readonly PipelineStepName[];
  readonly failedStep: PipelineStepName | null;
  readonly metrics: PipelineExecutionMetrics;
  readonly validationIssues: readonly string[];
}

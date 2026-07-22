import type { PipelineExecutionError } from "./PipelineExecutionError";
import type { PipelineExecutionStatus } from "./PipelineExecutionStatus";
import type { PipelineStepName } from "./PipelineStepName";

/**
 * One recorded step in the Program Generation pipeline.
 */
export interface PipelineExecutionStep {
  readonly name: PipelineStepName;
  readonly order: number;
  readonly status: PipelineExecutionStatus;
  /** Stable output identifier produced by this step, when applicable. */
  readonly outputId: string | null;
  readonly validationIssues: readonly string[];
  readonly error: PipelineExecutionError | null;
}

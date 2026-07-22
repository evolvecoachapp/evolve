/**
 * Structural pipeline metrics only — no timers or wall-clock measurements.
 */
export interface PipelineExecutionMetrics {
  readonly stepCount: number;
  readonly succeededStepCount: number;
  readonly failedStepCount: number;
  readonly skippedStepCount: number;
  readonly validationIssueCount: number;
  readonly explanationCount: number;
  readonly engineOutputCount: number;
}

export function createEmptyPipelineExecutionMetrics(): PipelineExecutionMetrics {
  return Object.freeze({
    stepCount: 0,
    succeededStepCount: 0,
    failedStepCount: 0,
    skippedStepCount: 0,
    validationIssueCount: 0,
    explanationCount: 0,
    engineOutputCount: 0,
  });
}

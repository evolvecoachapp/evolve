import type { PipelineExecutionMetrics } from "./PipelineExecutionMetrics";

/**
 * Explanation entry for a Program Generation run.
 *
 * Aggregates orchestration-level rationale — not engine-internal scoring.
 */
export interface WorkoutGenerationExplanation {
  readonly subjectId: string;
  readonly summaryCode: string;
  readonly stepName: string;
  readonly reasons: readonly WorkoutGenerationReason[];
  readonly metrics: PipelineExecutionMetrics | null;
}

export interface WorkoutGenerationReason {
  readonly code: string;
  readonly weight: number;
  readonly detail?: string;
}

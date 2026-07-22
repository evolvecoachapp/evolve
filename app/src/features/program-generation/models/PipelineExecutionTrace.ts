import type { PipelineExecutionStep } from "./PipelineExecutionStep";

/**
 * Ordered, immutable record of every pipeline step execution.
 */
export interface PipelineExecutionTrace {
  readonly generationId: string;
  readonly steps: readonly PipelineExecutionStep[];
}

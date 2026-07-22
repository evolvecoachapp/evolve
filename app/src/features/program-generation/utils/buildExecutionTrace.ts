import type { PipelineExecutionStep } from "../models/PipelineExecutionStep";
import type { PipelineExecutionTrace } from "../models/PipelineExecutionTrace";
import { normalizePipelineSteps } from "./normalizePipeline";

/**
 * Build an immutable execution trace from recorded steps.
 */
export function buildExecutionTrace(
  generationId: string,
  steps: readonly PipelineExecutionStep[],
): PipelineExecutionTrace {
  return Object.freeze({
    generationId,
    steps: normalizePipelineSteps(steps),
  });
}

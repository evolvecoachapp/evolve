import type { PipelineExecutionStep } from "../models/PipelineExecutionStep";
import type { WorkoutGenerationRequest } from "../models/WorkoutGenerationRequest";
import type { WorkoutGenerationResult } from "../models/WorkoutGenerationResult";
import { validateExecutionOrder } from "./validateExecutionOrder";
import {
  validateMissingDependencies,
  validatePipelineDependencies,
} from "./validateMissingDependencies";
import { validatePipelineConsistency } from "./validatePipelineConsistency";
import {
  validatePipelineIntegrity,
  validateRequiredOutputs,
} from "./validatePipelineIntegrity";

/**
 * Validate a generation request before orchestration begins.
 */
export function validateWorkoutGenerationRequest(
  request: WorkoutGenerationRequest,
): readonly string[] {
  return validateMissingDependencies(request);
}

/**
 * Run the full post-orchestration validation suite.
 */
export function validateWorkoutGenerationResult(
  result: WorkoutGenerationResult,
  steps: readonly PipelineExecutionStep[],
): readonly string[] {
  const issues = [
    ...validatePipelineIntegrity(steps),
    ...validateExecutionOrder(steps),
    ...validateRequiredOutputs(result),
    ...validatePipelineDependencies(result),
    ...validatePipelineConsistency(result),
  ];
  return Object.freeze([...new Set(issues)]);
}

export { validatePipelineIntegrity, validateRequiredOutputs };
export { validateExecutionOrder };
export {
  validateMissingDependencies,
  validatePipelineDependencies,
};
export { validatePipelineConsistency };

import type { PipelineExecutionContext } from "../models/PipelineExecutionContext";
import type { PipelineExecutionSummary } from "../models/PipelineExecutionSummary";
import type { PipelineExecutionTrace } from "../models/PipelineExecutionTrace";
import type { WorkoutGenerationExplanation } from "../models/WorkoutGenerationExplanation";
import type { WorkoutGenerationResult } from "../models/WorkoutGenerationResult";
import { normalizePipelineSteps } from "./normalizePipeline";

/**
 * Deep-freeze a WorkoutGenerationResult for immutability guarantees.
 */
export function freezeWorkoutGenerationResult(
  result: WorkoutGenerationResult,
): WorkoutGenerationResult {
  return Object.freeze({
    requestId: result.requestId,
    context: freezeContext(result.context),
    session: result.session,
    blueprint: result.blueprint,
    selection: result.selection,
    programming: result.programming,
    progression: result.progression,
    adaptation: result.adaptation,
    assembly: result.assembly,
    summary: freezeSummary(result.summary),
    trace: freezeTrace(result.trace),
    explanations: Object.freeze(result.explanations.map(freezeExplanation)),
    validationIssues: Object.freeze([...result.validationIssues]),
    generatedAt: result.generatedAt,
  });
}

function freezeContext(
  context: PipelineExecutionContext,
): PipelineExecutionContext {
  return Object.freeze({ ...context });
}

function freezeSummary(
  summary: PipelineExecutionSummary,
): PipelineExecutionSummary {
  return Object.freeze({
    ...summary,
    completedSteps: Object.freeze([...summary.completedSteps]),
    metrics: Object.freeze({ ...summary.metrics }),
    validationIssues: Object.freeze([...summary.validationIssues]),
  });
}

function freezeTrace(trace: PipelineExecutionTrace): PipelineExecutionTrace {
  return Object.freeze({
    generationId: trace.generationId,
    steps: normalizePipelineSteps(trace.steps),
  });
}

function freezeExplanation(
  explanation: WorkoutGenerationExplanation,
): WorkoutGenerationExplanation {
  return Object.freeze({
    ...explanation,
    reasons: Object.freeze(
      explanation.reasons.map((reason) => Object.freeze({ ...reason })),
    ),
    metrics: explanation.metrics
      ? Object.freeze({ ...explanation.metrics })
      : null,
  });
}

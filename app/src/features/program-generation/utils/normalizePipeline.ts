import type { PipelineExecutionError } from "../models/PipelineExecutionError";
import type { PipelineExecutionStatus } from "../models/PipelineExecutionStatus";
import type { PipelineExecutionStep } from "../models/PipelineExecutionStep";
import type { PipelineStepName } from "../models/PipelineStepName";

/**
 * Normalize pipeline steps: freeze entries, ensure stable order index.
 */
export function normalizePipelineSteps(
  steps: readonly PipelineExecutionStep[],
): readonly PipelineExecutionStep[] {
  return Object.freeze(
    steps.map((step, index) =>
      Object.freeze({
        name: step.name,
        order: index,
        status: step.status,
        outputId: step.outputId,
        validationIssues: Object.freeze([...step.validationIssues]),
        error: step.error ? freezeError(step.error) : null,
      }),
    ),
  );
}

/**
 * Create a succeeded step record.
 */
export function createSucceededStep(
  name: PipelineStepName,
  order: number,
  options: {
    readonly outputId?: string | null;
    readonly validationIssues?: readonly string[];
  } = {},
): PipelineExecutionStep {
  return Object.freeze({
    name,
    order,
    status: "succeeded" as const satisfies PipelineExecutionStatus,
    outputId: options.outputId ?? null,
    validationIssues: Object.freeze([...(options.validationIssues ?? [])]),
    error: null,
  });
}

/**
 * Create a failed step record.
 */
export function createFailedStep(
  name: PipelineStepName,
  order: number,
  error: PipelineExecutionError,
  validationIssues: readonly string[] = [],
): PipelineExecutionStep {
  return Object.freeze({
    name,
    order,
    status: "failed" as const satisfies PipelineExecutionStatus,
    outputId: null,
    validationIssues: Object.freeze([...validationIssues]),
    error: freezeError(error),
  });
}

function freezeError(error: PipelineExecutionError): PipelineExecutionError {
  return Object.freeze({
    code: error.code,
    message: error.message,
    step: error.step,
    details: Object.freeze({ ...error.details }),
  });
}

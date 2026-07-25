import type { ExplanationStep } from "../models/ExplanationStep";
import { EMPTY_EXPLANATION_METADATA } from "../models/ExplanationMetadata";

export function createTraceStep(input: {
  readonly id: string;
  readonly operation: string;
  readonly subjectId: string;
  readonly inputKeys?: readonly string[];
  readonly outputKeys?: readonly string[];
}): ExplanationStep {
  return Object.freeze({
    id: input.id,
    operation: input.operation,
    subjectId: input.subjectId,
    inputKeys: Object.freeze(input.inputKeys ?? []),
    outputKeys: Object.freeze(input.outputKeys ?? []),
    metadata: EMPTY_EXPLANATION_METADATA,
  });
}

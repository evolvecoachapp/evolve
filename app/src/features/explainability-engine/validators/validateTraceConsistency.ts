import type { ExplanationTrace } from "../models/ExplanationTrace";
import { createExplanationError, ExplanationErrorCodes } from "../models/ExplanationError";
import type { ExplanationError } from "../models/ExplanationError";

export function validateTraceConsistency(
  trace: ExplanationTrace | null,
): readonly ExplanationError[] {
  if (!trace) return Object.freeze([]);
  const errors: ExplanationError[] = [];
  if (trace.steps.length === 0) errors.push(createExplanationError(ExplanationErrorCodes.VALIDATION_FAILED, "Trace must include steps", trace.id));
  return Object.freeze(errors);
}

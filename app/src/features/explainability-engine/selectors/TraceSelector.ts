import type { ExplanationStep } from "../models/ExplanationStep";
import type { ExplanationTrace } from "../models/ExplanationTrace";

export function selectTraceSteps(
  trace: ExplanationTrace,
  operation: string,
): readonly ExplanationStep[] {
  return Object.freeze(trace.steps.filter((s) => s.operation === operation));
}

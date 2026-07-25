import type { ExplanationTrace } from "../models/ExplanationTrace";
import { freezeTrace } from "../utils/FreezeExplanationState";

export function applyTracePolicy(trace: ExplanationTrace): ExplanationTrace {
  return freezeTrace(trace);
}

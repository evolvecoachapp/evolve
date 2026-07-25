import { severityForSignalCount, type AdaptationSeverity } from "../models/AdaptationSeverity";

/** Deterministic signal-count table only. */
export function evaluateSeverity(signalCount: number): AdaptationSeverity {
  return severityForSignalCount(signalCount);
}

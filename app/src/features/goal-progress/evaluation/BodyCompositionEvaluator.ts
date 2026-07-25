import { riskForSignalCount, type GoalRisk } from "../models/GoalRisk";

/** Deterministic signal-count table only. */
export function evaluateSeverity(signalCount: number): GoalRisk {
  return riskForSignalCount(signalCount);
}

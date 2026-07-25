import type { DecisionContext } from "../models/DecisionContext";
import { presentSourceKeys } from "../utils/DecisionHelpers";

export interface ContextAnalysisReport {
  readonly sourceKeys: readonly string[];
  readonly hasAthlete: boolean;
  readonly hasSession: boolean;
  readonly conflictCount: number;
  readonly focusAreas: readonly string[];
}

/**
 * Deterministic context analysis — inventory of fused facts only.
 */
export function analyzeContext(input: {
  readonly decisionContext: DecisionContext;
}): ContextAnalysisReport {
  const ctx = input.decisionContext.unified;
  return Object.freeze({
    sourceKeys: presentSourceKeys(ctx),
    hasAthlete: ctx.athlete !== null,
    hasSession: ctx.session !== null,
    conflictCount: ctx.conflicts.length,
    focusAreas: Object.freeze([...input.decisionContext.focusAreas]),
  });
}

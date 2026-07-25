import type { DecisionCandidate } from "../models/DecisionCandidate";

/**
 * Deterministic consistency evaluation — evidence presence only.
 */
export function evaluateConsistency(
  candidate: DecisionCandidate,
): number {
  if (candidate.sourceKeys.length === 0) return 20;
  if (candidate.sourceKeys.length === 1) return 60;
  return 90;
}

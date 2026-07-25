import type { DecisionCandidate } from "../models/DecisionCandidate";

/**
 * Deterministic risk component — category table only (no domain math).
 */
export function evaluateRisk(candidate: DecisionCandidate): number {
  if (candidate.category === "safety") return 100;
  if (candidate.intent === "block") return 90;
  if (candidate.category === "recovery") return 70;
  return 40;
}

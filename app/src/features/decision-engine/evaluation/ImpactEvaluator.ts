import type { DecisionCandidate } from "../models/DecisionCandidate";

/**
 * Deterministic impact component — intent table only.
 */
export function evaluateImpact(candidate: DecisionCandidate): number {
  switch (candidate.intent) {
    case "block":
      return 100;
    case "prioritize":
      return 80;
    case "escalate":
      return 75;
    case "recommend":
      return 60;
    case "continue":
      return 50;
    case "resolve":
      return 55;
    case "defer":
      return 30;
    default:
      return 40;
  }
}

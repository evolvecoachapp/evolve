import type { DecisionCandidate } from "../models/DecisionCandidate";
import type { DecisionConfidence } from "../models/DecisionConfidence";
import { freezeConfidence } from "../utils/FreezeDecisionState";

/**
 * Deterministic confidence evaluation — structural evidence only.
 */
export function evaluateConfidence(
  candidate: DecisionCandidate,
): DecisionConfidence {
  const evidence = candidate.reasons.length + candidate.sourceKeys.length;
  let level: DecisionConfidence["level"] = "unknown";
  let score = 0;
  if (evidence === 0) {
    level = "unknown";
    score = 0;
  } else if (evidence === 1) {
    level = "low";
    score = 40;
  } else if (evidence === 2) {
    level = "medium";
    score = 65;
  } else if (evidence <= 4) {
    level = "high";
    score = 85;
  } else {
    level = "complete";
    score = 100;
  }
  return freezeConfidence({
    level,
    score,
    evidenceCount: evidence,
    notes: Object.freeze([`evidence=${evidence}`]),
  });
}

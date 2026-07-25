import type { DecisionCandidate } from "../models/DecisionCandidate";
import type { DecisionScore } from "../models/DecisionScore";

/**
 * Deterministic priority evaluation — ordinal table only.
 */
export function evaluatePriority(
  candidate: DecisionCandidate,
): Pick<DecisionScore, "priorityComponent"> {
  const component = Math.max(0, 100 - candidate.priority.ordinal * 10);
  return Object.freeze({ priorityComponent: component });
}

/**
 * Confidence that a domain decision is well-supported by evidence.
 * Range is [0, 1] inclusive.
 */
export type DecisionConfidence = number;

export const DECISION_CONFIDENCE_MIN = 0;
export const DECISION_CONFIDENCE_MAX = 1;

export function isValidDecisionConfidence(
  value: number,
): value is DecisionConfidence {
  return (
    Number.isFinite(value) &&
    value >= DECISION_CONFIDENCE_MIN &&
    value <= DECISION_CONFIDENCE_MAX
  );
}

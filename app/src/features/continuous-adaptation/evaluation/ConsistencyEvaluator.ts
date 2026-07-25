/**
 * Deterministic ordinal table:
 * triggers vs candidates alignment → 0 (aligned) .. 3 (sparse).
 */
export function evaluateConsistencyOrdinal(
  presentTriggerCount: number,
  candidateCount: number,
): number {
  if (presentTriggerCount === 0 && candidateCount === 0) return 0;
  if (presentTriggerCount === candidateCount) return 0;
  if (Math.abs(presentTriggerCount - candidateCount) === 1) return 1;
  if (Math.abs(presentTriggerCount - candidateCount) === 2) return 2;
  return 3;
}

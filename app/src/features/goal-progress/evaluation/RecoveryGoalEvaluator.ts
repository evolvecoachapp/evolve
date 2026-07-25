/**
 * Deterministic table: riskOrdinal = clamp(severityOrdinal + triggerBonus, 0, 4)
 * where triggerBonus is 0 if triggers<=1 else 1 if triggers<=3 else 2.
 */
export function evaluateRecoveryGoalOrdinal(severityOrdinal: number, presentTriggerCount: number): number {
  const bonus = presentTriggerCount <= 1 ? 0 : presentTriggerCount <= 3 ? 1 : 2;
  return Math.max(0, Math.min(4, severityOrdinal + bonus));
}

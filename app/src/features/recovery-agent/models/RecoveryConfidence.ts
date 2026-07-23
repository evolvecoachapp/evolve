export const RecoveryConfidenceLabels = Object.freeze({
  LOW: "low" as const,
  MEDIUM: "medium" as const,
  HIGH: "high" as const,
});

export type RecoveryConfidenceLabel =
  (typeof RecoveryConfidenceLabels)[keyof typeof RecoveryConfidenceLabels];

export interface RecoveryConfidence {
  readonly score: number;
  readonly label: RecoveryConfidenceLabel;
  readonly rationale: string;
}

export function labelFromScore(score: number): RecoveryConfidenceLabel {
  if (score >= 0.75) return RecoveryConfidenceLabels.HIGH;
  if (score >= 0.45) return RecoveryConfidenceLabels.MEDIUM;
  return RecoveryConfidenceLabels.LOW;
}

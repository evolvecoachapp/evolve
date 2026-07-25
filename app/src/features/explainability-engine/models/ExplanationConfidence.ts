export const ExplanationConfidenceLevels = {
  HIGH: "high",
  MEDIUM: "medium",
  LOW: "low",
} as const;

export type ExplanationConfidenceLevel =
  (typeof ExplanationConfidenceLevels)[keyof typeof ExplanationConfidenceLevels];

export interface ExplanationConfidence {
  readonly level: ExplanationConfidenceLevel;
  readonly score: number;
  readonly evidenceCount: number;
  readonly notes: readonly string[];
}

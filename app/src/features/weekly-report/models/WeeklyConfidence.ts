/**
 * Deterministic Weekly Coach Report confidence.
 * Calculated only from available evidence — never from an LLM.
 */
export const WeeklyConfidenceLevels = {
  HIGH: "high",
  MEDIUM: "medium",
  LOW: "low",
  NONE: "none",
} as const;

export type WeeklyConfidenceLevel =
  (typeof WeeklyConfidenceLevels)[keyof typeof WeeklyConfidenceLevels];

export interface WeeklyConfidence {
  readonly level: WeeklyConfidenceLevel;
  readonly score: number;
  readonly evidenceCount: number;
  readonly sourceCount: number;
  readonly rationale: string;
}

export const EMPTY_WEEKLY_CONFIDENCE: WeeklyConfidence = Object.freeze({
  level: WeeklyConfidenceLevels.NONE,
  score: 0,
  evidenceCount: 0,
  sourceCount: 0,
  rationale: "No evidence available",
});

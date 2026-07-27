/**
 * Deterministic Daily Brief confidence.
 * Calculated only from available evidence — never from an LLM.
 */
export const DailyBriefConfidenceLevels = {
  HIGH: "high",
  MEDIUM: "medium",
  LOW: "low",
  NONE: "none",
} as const;

export type DailyBriefConfidenceLevel =
  (typeof DailyBriefConfidenceLevels)[keyof typeof DailyBriefConfidenceLevels];

export interface DailyBriefConfidence {
  readonly level: DailyBriefConfidenceLevel;
  readonly score: number;
  readonly evidenceCount: number;
  readonly sourceCount: number;
  readonly rationale: string;
}

export const EMPTY_DAILY_BRIEF_CONFIDENCE: DailyBriefConfidence = Object.freeze({
  level: DailyBriefConfidenceLevels.NONE,
  score: 0,
  evidenceCount: 0,
  sourceCount: 0,
  rationale: "No evidence available",
});

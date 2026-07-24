export const SessionConfidenceLevels = {
  HIGH: "high",
  MEDIUM: "medium",
  LOW: "low",
  UNKNOWN: "unknown",
} as const;

export type SessionConfidenceLevel =
  (typeof SessionConfidenceLevels)[keyof typeof SessionConfidenceLevels];

export interface SessionConfidence {
  readonly level: SessionConfidenceLevel;
  readonly score: number;
  readonly rationale: string | null;
}

export const EMPTY_SESSION_CONFIDENCE: SessionConfidence = Object.freeze({
  level: SessionConfidenceLevels.UNKNOWN,
  score: 0,
  rationale: null,
});

/**
 * Deterministic coaching-session confidence.
 * Calculated only from available evidence — never from an LLM.
 */
export const CoachingSessionConfidenceLevels = {
  HIGH: "high",
  MEDIUM: "medium",
  LOW: "low",
  NONE: "none",
} as const;

export type CoachingSessionConfidenceLevel =
  (typeof CoachingSessionConfidenceLevels)[keyof typeof CoachingSessionConfidenceLevels];

export interface CoachingSessionConfidence {
  readonly level: CoachingSessionConfidenceLevel;
  readonly score: number;
  readonly evidenceCount: number;
  readonly sourceCount: number;
  readonly rationale: string;
}

export const EMPTY_COACHING_SESSION_CONFIDENCE: CoachingSessionConfidence =
  Object.freeze({
    level: CoachingSessionConfidenceLevels.NONE,
    score: 0,
    evidenceCount: 0,
    sourceCount: 0,
    rationale: "No evidence available",
  });

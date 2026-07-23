export const SupervisorConfidenceLevels = {
  HIGH: "high",
  MEDIUM: "medium",
  LOW: "low",
  UNKNOWN: "unknown",
} as const;

export type SupervisorConfidenceLevel =
  (typeof SupervisorConfidenceLevels)[keyof typeof SupervisorConfidenceLevels];

/**
 * Immutable structural confidence descriptor (no AI scoring).
 */
export interface SupervisorConfidence {
  readonly level: SupervisorConfidenceLevel;
  readonly score: number;
  readonly rationale: string | null;
}

export const GoalRiskLevels = {
  CRITICAL: "critical",
  HIGH: "high",
  MEDIUM: "medium",
  LOW: "low",
  NONE: "none",
} as const;

export type GoalRiskLevel =
  (typeof GoalRiskLevels)[keyof typeof GoalRiskLevels];

export interface GoalRisk {
  readonly level: GoalRiskLevel;
  readonly ordinal: number;
}

/** Deterministic signal-count → severity table. */
export function riskForSignalCount(count: number): GoalRisk {
  const n = Math.max(0, Math.floor(count));
  if (n >= 4) return Object.freeze({ level: GoalRiskLevels.CRITICAL, ordinal: 0 });
  if (n === 3) return Object.freeze({ level: GoalRiskLevels.HIGH, ordinal: 1 });
  if (n === 2) return Object.freeze({ level: GoalRiskLevels.MEDIUM, ordinal: 2 });
  if (n === 1) return Object.freeze({ level: GoalRiskLevels.LOW, ordinal: 3 });
  return Object.freeze({ level: GoalRiskLevels.NONE, ordinal: 4 });
}

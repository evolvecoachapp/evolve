export const AdaptationSeverityLevels = {
  CRITICAL: "critical",
  HIGH: "high",
  MEDIUM: "medium",
  LOW: "low",
  NONE: "none",
} as const;

export type AdaptationSeverityLevel =
  (typeof AdaptationSeverityLevels)[keyof typeof AdaptationSeverityLevels];

export interface AdaptationSeverity {
  readonly level: AdaptationSeverityLevel;
  readonly ordinal: number;
}

/** Deterministic signal-count → severity table. */
export function severityForSignalCount(count: number): AdaptationSeverity {
  const n = Math.max(0, Math.floor(count));
  if (n >= 4) return Object.freeze({ level: AdaptationSeverityLevels.CRITICAL, ordinal: 0 });
  if (n === 3) return Object.freeze({ level: AdaptationSeverityLevels.HIGH, ordinal: 1 });
  if (n === 2) return Object.freeze({ level: AdaptationSeverityLevels.MEDIUM, ordinal: 2 });
  if (n === 1) return Object.freeze({ level: AdaptationSeverityLevels.LOW, ordinal: 3 });
  return Object.freeze({ level: AdaptationSeverityLevels.NONE, ordinal: 4 });
}

/**
 * Deterministic Daily Brief priority levels.
 * Never assigned by an LLM.
 */
export const DailyBriefPriorities = {
  LOW: "LOW",
  NORMAL: "NORMAL",
  HIGH: "HIGH",
  CRITICAL: "CRITICAL",
} as const;

export type DailyBriefPriority =
  (typeof DailyBriefPriorities)[keyof typeof DailyBriefPriorities];

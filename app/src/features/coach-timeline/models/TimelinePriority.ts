export const TimelinePriorities = {
  LOW: "low",
  NORMAL: "normal",
  HIGH: "high",
  CRITICAL: "critical",
} as const;

export type TimelinePriority = (typeof TimelinePriorities)[keyof typeof TimelinePriorities];

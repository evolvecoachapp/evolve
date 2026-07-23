/**
 * Immutable agent priority levels (framework selection only).
 */
export type AgentPriority =
  | "critical"
  | "high"
  | "normal"
  | "low"
  | "background";

export const AgentPriorities = Object.freeze({
  CRITICAL: "critical",
  HIGH: "high",
  NORMAL: "normal",
  LOW: "low",
  BACKGROUND: "background",
} as const satisfies Record<string, AgentPriority>);

export const ALL_AGENT_PRIORITIES: readonly AgentPriority[] = Object.freeze([
  AgentPriorities.CRITICAL,
  AgentPriorities.HIGH,
  AgentPriorities.NORMAL,
  AgentPriorities.LOW,
  AgentPriorities.BACKGROUND,
]);

export const AGENT_PRIORITY_RANK: Readonly<Record<AgentPriority, number>> =
  Object.freeze({
    critical: 100,
    high: 75,
    normal: 50,
    low: 25,
    background: 0,
  });

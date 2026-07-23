/**
 * Declared routing priority levels (not scored / ranked by AI).
 * Lower rank number = higher priority in deterministic ordering.
 */
export const RoutingPriorityLevels = {
  CRITICAL: "critical",
  HIGH: "high",
  NORMAL: "normal",
  LOW: "low",
} as const;

export type RoutingPriorityLevel =
  (typeof RoutingPriorityLevels)[keyof typeof RoutingPriorityLevels];

export const ROUTING_PRIORITY_RANK: Readonly<
  Record<RoutingPriorityLevel, number>
> = Object.freeze({
  [RoutingPriorityLevels.CRITICAL]: 0,
  [RoutingPriorityLevels.HIGH]: 1,
  [RoutingPriorityLevels.NORMAL]: 2,
  [RoutingPriorityLevels.LOW]: 3,
});

/**
 * Immutable priority assignment for a capability or target.
 */
export interface RoutingPriority {
  readonly id: string;
  readonly subjectId: string;
  readonly level: RoutingPriorityLevel;
  readonly rank: number;
  readonly reason: string | null;
}

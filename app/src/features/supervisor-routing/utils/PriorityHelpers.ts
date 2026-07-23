import {
  ROUTING_PRIORITY_RANK,
  RoutingPriorityLevels,
  type RoutingPriorityLevel,
} from "../models/RoutingPriority";

export function normalizePriorityLevel(
  level: string | null | undefined,
): RoutingPriorityLevel {
  switch (level) {
    case RoutingPriorityLevels.CRITICAL:
    case RoutingPriorityLevels.HIGH:
    case RoutingPriorityLevels.NORMAL:
    case RoutingPriorityLevels.LOW:
      return level;
    default:
      return RoutingPriorityLevels.NORMAL;
  }
}

export function comparePriorityLevels(
  a: RoutingPriorityLevel,
  b: RoutingPriorityLevel,
): number {
  return ROUTING_PRIORITY_RANK[a] - ROUTING_PRIORITY_RANK[b];
}

export function priorityRank(level: RoutingPriorityLevel): number {
  return ROUTING_PRIORITY_RANK[level];
}

export const PriorityHelpers = Object.freeze({
  normalizePriorityLevel,
  comparePriorityLevels,
  priorityRank,
});

import {
  ROUTING_PRIORITY_RANK,
  type RoutingPriorityLevel,
} from "../models/RoutingPriority";
import {
  RoutingPolicyKinds,
  type RoutingPolicy,
} from "../models/RoutingPolicy";

/**
 * Priority policy — declared levels only (no scoring).
 */
export class PriorityPolicy {
  readonly policy: RoutingPolicy = Object.freeze({
    id: "policy:routing:priority",
    kind: RoutingPolicyKinds.PRIORITY,
    name: "PriorityPolicy",
    description: "Orders by declared priority rank, then stable id.",
    enabled: true,
  });

  compare(
    a: { priority: RoutingPriorityLevel; id: string },
    b: { priority: RoutingPriorityLevel; id: string },
  ): number {
    const byRank =
      ROUTING_PRIORITY_RANK[a.priority] - ROUTING_PRIORITY_RANK[b.priority];
    if (byRank !== 0) return byRank;
    return a.id.localeCompare(b.id);
  }
}

export function createPriorityPolicy(): PriorityPolicy {
  return new PriorityPolicy();
}

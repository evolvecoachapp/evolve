import type { RoutingCapability } from "../models/RoutingCapability";
import type { RoutingPriority } from "../models/RoutingPriority";
import { ROUTING_PRIORITY_RANK } from "../models/RoutingPriority";
import { createPriorityPolicy } from "../policies/PriorityPolicy";

/**
 * Selects declared priorities (deterministic ordering helper).
 */
export class PrioritySelector {
  private readonly policy = createPriorityPolicy();

  select(capabilities: readonly RoutingCapability[]): readonly RoutingPriority[] {
    const priorities = capabilities.map((capability) =>
      Object.freeze({
        id: `priority:${capability.capabilityId}`,
        subjectId: capability.capabilityId,
        level: capability.priority,
        rank: ROUTING_PRIORITY_RANK[capability.priority],
        reason: "declared",
      }),
    );

    return Object.freeze(
      [...priorities].sort((a, b) =>
        this.policy.compare(
          { priority: a.level, id: a.subjectId },
          { priority: b.level, id: b.subjectId },
        ),
      ),
    );
  }
}

export function createPrioritySelector(): PrioritySelector {
  return new PrioritySelector();
}

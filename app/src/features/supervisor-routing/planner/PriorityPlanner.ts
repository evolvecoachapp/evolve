import type { RoutingCapability } from "../models/RoutingCapability";
import type { RoutingPriority } from "../models/RoutingPriority";
import { createPrioritySelector } from "../selectors/PrioritySelector";

/**
 * Plans declared priority assignments.
 */
export class PriorityPlanner {
  private readonly selector = createPrioritySelector();

  plan(capabilities: readonly RoutingCapability[]): readonly RoutingPriority[] {
    return this.selector.select(capabilities);
  }
}

export function createPriorityPlanner(): PriorityPlanner {
  return new PriorityPlanner();
}

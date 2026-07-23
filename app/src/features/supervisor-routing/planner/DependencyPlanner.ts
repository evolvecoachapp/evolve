import type { RoutingCapability } from "../models/RoutingCapability";
import type { RoutingDependency } from "../models/RoutingDependency";
import { RoutingDependencyKinds } from "../models/RoutingDependency";
import { sortDependenciesDeterministic } from "../utils/sortHelpers";

/**
 * Plans capability dependency edges used for ordering / graph building.
 */
export class DependencyPlanner {
  plan(input: {
    readonly capabilities: readonly RoutingCapability[];
    readonly dependencies: readonly RoutingDependency[];
  }): readonly RoutingDependency[] {
    const capabilityIds = new Set(
      input.capabilities.map((item) => item.capabilityId),
    );

    const filtered = input.dependencies.filter(
      (dep) =>
        dep.kind === RoutingDependencyKinds.CAPABILITY &&
        capabilityIds.has(dep.fromId) &&
        capabilityIds.has(dep.toId),
    );

    return sortDependenciesDeterministic(filtered);
  }
}

export function createDependencyPlanner(): DependencyPlanner {
  return new DependencyPlanner();
}

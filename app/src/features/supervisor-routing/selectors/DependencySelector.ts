import type { RoutingCapability } from "../models/RoutingCapability";
import type { RoutingDependency } from "../models/RoutingDependency";
import { RoutingDependencyKinds } from "../models/RoutingDependency";
import type { RoutingRequest } from "../models/RoutingRequest";
import { sortDependenciesDeterministic } from "../utils/sortHelpers";

/**
 * Selects / derives capability dependencies (declared + capability.dependsOn).
 */
export class DependencySelector {
  select(input: {
    readonly request: RoutingRequest;
    readonly capabilities: readonly RoutingCapability[];
  }): readonly RoutingDependency[] {
    const fromRequest = [...input.request.dependencies];
    const derived: RoutingDependency[] = [];

    for (const capability of input.capabilities) {
      for (const depId of capability.dependsOn) {
        derived.push(
          Object.freeze({
            id: `dep:${capability.capabilityId}->${depId}`,
            kind: RoutingDependencyKinds.CAPABILITY,
            fromId: capability.capabilityId,
            toId: depId,
            required: true,
            description: "capability.dependsOn",
          }),
        );
      }
    }

    return sortDependenciesDeterministic([...fromRequest, ...derived]);
  }
}

export function createDependencySelector(): DependencySelector {
  return new DependencySelector();
}

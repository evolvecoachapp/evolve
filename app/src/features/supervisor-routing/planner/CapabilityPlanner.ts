import type { RoutingCapability } from "../models/RoutingCapability";
import type { ResolvedRoutingCapability } from "../resolver/RoutingResolver";
import { sortCapabilitiesDeterministic } from "../utils/sortHelpers";

/**
 * Plans the capability set included in a routing plan (resolved only).
 */
export class CapabilityPlanner {
  plan(
    resolved: readonly ResolvedRoutingCapability[],
  ): readonly RoutingCapability[] {
    return sortCapabilitiesDeterministic(
      resolved
        .filter((item) => item.resolved)
        .map((item) => item.capability),
    );
  }
}

export function createCapabilityPlanner(): CapabilityPlanner {
  return new CapabilityPlanner();
}

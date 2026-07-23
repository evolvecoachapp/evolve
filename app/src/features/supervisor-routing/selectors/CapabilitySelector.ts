import type { RoutingCapability } from "../models/RoutingCapability";
import type { RoutingRequest } from "../models/RoutingRequest";
import { sortCapabilitiesDeterministic } from "../utils/sortHelpers";

/**
 * Selects required capabilities from a routing request (exact list, no ranking).
 */
export class CapabilitySelector {
  select(request: RoutingRequest): readonly RoutingCapability[] {
    return sortCapabilitiesDeterministic(request.requiredCapabilities);
  }

  selectRequired(request: RoutingRequest): readonly RoutingCapability[] {
    return sortCapabilitiesDeterministic(
      request.requiredCapabilities.filter((item) => item.required),
    );
  }
}

export function createCapabilitySelector(): CapabilitySelector {
  return new CapabilitySelector();
}

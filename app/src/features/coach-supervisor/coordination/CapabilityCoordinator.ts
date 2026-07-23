import type { RoutingResolution } from "../contracts/RoutingPort";
import { selectCapabilities } from "../selectors/CapabilitySelector";

export class CapabilityCoordinator {
  coordinate(routing: RoutingResolution): readonly string[] {
    return selectCapabilities(routing.targets);
  }
}

export function createCapabilityCoordinator(): CapabilityCoordinator {
  return new CapabilityCoordinator();
}

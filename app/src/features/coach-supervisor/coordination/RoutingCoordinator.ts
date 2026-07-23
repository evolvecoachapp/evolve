import type { RoutingPort, RoutingResolution } from "../contracts/RoutingPort";
import type { CoachSupervisorRequest } from "../models/CoachSupervisorRequest";
import { validateRoutingIntegrity } from "../validators/validateRoutingIntegrity";

export class RoutingCoordinator {
  constructor(private readonly routingPort: RoutingPort) {}

  coordinate(request: CoachSupervisorRequest): {
    readonly routing: RoutingResolution;
    readonly valid: boolean;
  } {
    const routing = this.routingPort.resolve(request);
    const validation = validateRoutingIntegrity(routing);
    return Object.freeze({
      routing,
      valid: validation.valid,
    });
  }
}

export function createRoutingCoordinator(
  routingPort: RoutingPort,
): RoutingCoordinator {
  return new RoutingCoordinator(routingPort);
}

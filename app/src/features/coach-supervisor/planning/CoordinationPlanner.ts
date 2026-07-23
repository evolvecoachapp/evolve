import { buildCoordinationPlan } from "../builders/CoordinationPlanBuilder";
import type { RoutingResolution } from "../contracts/RoutingPort";
import type { CoachSupervisorRequest } from "../models/CoachSupervisorRequest";
import type { CoordinationPlan } from "../models/CoordinationPlan";

export class CoordinationPlanner {
  plan(input: {
    readonly request: CoachSupervisorRequest;
    readonly routing: RoutingResolution;
    readonly planId: string;
    readonly createdAt: string;
  }): CoordinationPlan {
    return buildCoordinationPlan({
      id: input.planId,
      request: input.request,
      targets: input.routing.targets,
      routingPlanId: input.routing.routingPlanId,
      createdAt: input.createdAt,
    });
  }
}

export function createCoordinationPlanner(): CoordinationPlanner {
  return new CoordinationPlanner();
}

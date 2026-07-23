import { buildSupervisorPlan } from "../builders/SupervisorPlanBuilder";
import type { RoutingResolution } from "../contracts/RoutingPort";
import type { CoachSupervisorPlan } from "../models/CoachSupervisorPlan";
import type { CoachSupervisorRequest } from "../models/CoachSupervisorRequest";
import { createCoordinationPlanner } from "./CoordinationPlanner";

/**
 * Top-level deterministic supervisor planner (planning only).
 */
export class SupervisorPlanner {
  private readonly coordinationPlanner = createCoordinationPlanner();

  plan(input: {
    readonly request: CoachSupervisorRequest;
    readonly routing: RoutingResolution;
    readonly planId: string;
    readonly createdAt: string;
  }): CoachSupervisorPlan {
    const coordination = this.coordinationPlanner.plan({
      request: input.request,
      routing: input.routing,
      planId: `${input.planId}:coord`,
      createdAt: input.createdAt,
    });
    return buildSupervisorPlan({
      id: input.planId,
      coordination,
      createdAt: input.createdAt,
      fail: !input.routing.success,
    });
  }
}

export function createSupervisorPlanner(): SupervisorPlanner {
  return new SupervisorPlanner();
}

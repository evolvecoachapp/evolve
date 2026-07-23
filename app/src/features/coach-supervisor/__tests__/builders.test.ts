import { buildCoordinationPlan } from "../builders/CoordinationPlanBuilder";
import { buildSupervisorContext } from "../builders/SupervisorContextBuilder";
import { buildSupervisorPlan } from "../builders/SupervisorPlanBuilder";
import { createMockRoutingPort } from "../contracts/RoutingPort";
import {
  createSupervisorRequest,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";

describe("coach-supervisor builders", () => {
  it("builds frozen context, coordination plan, and supervisor plan", () => {
    const request = createSupervisorRequest();
    const routing = createMockRoutingPort().resolve(request);
    const coordination = buildCoordinationPlan({
      id: "cplan:b",
      request,
      targets: routing.targets,
      routingPlanId: routing.routingPlanId,
      createdAt: FIXED_TIMESTAMP,
    });
    expect(Object.isFrozen(coordination)).toBe(true);
    expect(coordination.steps.length).toBeGreaterThan(0);

    const plan = buildSupervisorPlan({
      id: "splan:b",
      coordination,
      createdAt: FIXED_TIMESTAMP,
    });
    expect(Object.isFrozen(plan)).toBe(true);

    const context = buildSupervisorContext({
      id: "sctx:b",
      request,
      selectedAgentIds: coordination.orderedAgentIds,
      selectedCapabilityIds: coordination.orderedCapabilityIds,
      createdAt: FIXED_TIMESTAMP,
    });
    expect(Object.isFrozen(context)).toBe(true);
  });
});

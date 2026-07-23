import { createMockCollaborationPort } from "../contracts/CollaborationPort";
import { createMockRoutingPort } from "../contracts/RoutingPort";
import { createCoordinationEngine } from "../coordination/CoordinationEngine";
import {
  createSupervisorRequest,
  createFixedClock,
} from "../testSupport/fixtures";

describe("coach-supervisor coordination", () => {
  it("coordinates routing into a plan and executes via collaboration port", () => {
    const engine = createCoordinationEngine({
      routingPort: createMockRoutingPort(),
      collaborationPort: createMockCollaborationPort(),
    });
    const request = createSupervisorRequest();
    const clock = createFixedClock();
    const coordinated = engine.buildPlan({
      request,
      planId: "splan:coord",
      createdAt: clock(),
    });

    expect(coordinated.success).toBe(true);
    expect(coordinated.plan).not.toBeNull();

    const executed = engine.getExecutionCoordinator().coordinate({
      plan: coordinated.plan!.coordination,
      clock,
    });
    expect(executed.success).toBe(true);
    expect(executed.summaries).toHaveLength(2);
    expect(executed.consistent).toBe(true);
  });
});

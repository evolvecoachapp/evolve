import { createMockRoutingPort } from "../contracts/RoutingPort";
import { createCoordinationPlanner } from "../planning/CoordinationPlanner";
import {
  createSupervisorRequest,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";
import { validateCoordinationPlan } from "../validators/validateCoordinationPlan";
import { validateRoutingIntegrity } from "../validators/validateRoutingIntegrity";
import { validateSupervisorRequest } from "../validators/validateSupervisorRequest";

describe("coach-supervisor validators", () => {
  it("validates request, routing, and coordination plan", () => {
    const request = createSupervisorRequest();
    expect(validateSupervisorRequest(request).valid).toBe(true);

    const empty = createSupervisorRequest({ requiredCapabilityIds: [] });
    expect(validateSupervisorRequest(empty).valid).toBe(false);

    const routing = createMockRoutingPort().resolve(request);
    expect(validateRoutingIntegrity(routing).valid).toBe(true);

    const plan = createCoordinationPlanner().plan({
      request,
      routing,
      planId: "cplan:v",
      createdAt: FIXED_TIMESTAMP,
    });
    expect(validateCoordinationPlan(plan).valid).toBe(true);
  });
});

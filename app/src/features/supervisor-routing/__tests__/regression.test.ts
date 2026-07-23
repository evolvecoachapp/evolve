import { buildRoutingPlan } from "../application";
import {
  createTestRoutingService,
  createRoutingRequest,
  createRoutingCapability,
  WellKnownCapabilityIds,
} from "../testSupport/fixtures";

describe("supervisor-routing regression", () => {
  it("produces stable deterministic plans for the same request", () => {
    const service = createTestRoutingService();
    const request = createRoutingRequest({
      requiredCapabilities: [
        createRoutingCapability({
          capabilityId: WellKnownCapabilityIds.ANALYZE_NUTRITION,
        }),
        createRoutingCapability({
          capabilityId: WellKnownCapabilityIds.GENERATE_WORKOUT,
          dependsOn: [WellKnownCapabilityIds.ANALYZE_NUTRITION],
        }),
      ],
    });

    const first = buildRoutingPlan({ service, request });
    const second = buildRoutingPlan({ service, request });

    expect(first.plan?.steps.map((s) => s.capabilityId)).toEqual(
      second.plan?.steps.map((s) => s.capabilityId),
    );
    expect(first.plan?.targets.map((t) => t.agentId)).toEqual(
      second.plan?.targets.map((t) => t.agentId),
    );
    expect(first.plan?.steps.map((s) => s.capabilityId)).toEqual([
      WellKnownCapabilityIds.ANALYZE_NUTRITION,
      WellKnownCapabilityIds.GENERATE_WORKOUT,
    ]);
  });

  it("never mutates the original request capabilities array", () => {
    const service = createTestRoutingService();
    const request = createRoutingRequest();
    const before = request.requiredCapabilities.length;
    buildRoutingPlan({ service, request });
    expect(request.requiredCapabilities).toHaveLength(before);
    expect(Object.isFrozen(request)).toBe(true);
  });
});

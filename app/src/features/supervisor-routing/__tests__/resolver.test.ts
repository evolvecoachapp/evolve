import { createRoutingResolver } from "../resolver/RoutingResolver";
import {
  createMockCapabilityRegistry,
  createRoutingCapability,
  createFixedClock,
  WellKnownCapabilityIds,
} from "../testSupport/fixtures";

describe("supervisor-routing resolver", () => {
  it("resolves exact capability owners deterministically", () => {
    const resolver = createRoutingResolver({
      registry: createMockCapabilityRegistry(),
      clock: createFixedClock(),
    });

    const resolution = resolver.resolve({
      capabilities: [
        createRoutingCapability({
          capabilityId: WellKnownCapabilityIds.ANALYZE_NUTRITION,
        }),
      ],
    });

    expect(resolution.resolved[0]?.resolved).toBe(true);
    expect(resolution.owners[0]?.agentId).toBe("agent:nutrition");
    expect(resolution.candidateAgentIds).toEqual(["agent:nutrition"]);
  });

  it("does not resolve disabled capabilities", () => {
    const registry = createMockCapabilityRegistry([
      {
        capabilityId: WellKnownCapabilityIds.GENERATE_WORKOUT,
        agentId: "agent:workout",
        enabled: false,
        name: "Generate Workout",
      },
    ]);
    const resolver = createRoutingResolver({
      registry,
      clock: createFixedClock(),
    });

    const resolution = resolver.resolve({
      capabilities: [
        createRoutingCapability({
          capabilityId: WellKnownCapabilityIds.GENERATE_WORKOUT,
        }),
      ],
    });

    expect(resolution.resolved[0]?.resolved).toBe(false);
    expect(resolution.unresolvedCapabilityIds).toEqual([
      WellKnownCapabilityIds.GENERATE_WORKOUT,
    ]);
  });
});

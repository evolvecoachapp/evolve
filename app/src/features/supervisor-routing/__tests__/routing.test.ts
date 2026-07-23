import { createRoutingEngine } from "../routing/RoutingEngine";
import { RoutingStates } from "../routing/RoutingState";
import {
  createMockCapabilityRegistry,
  createRoutingRequest,
  createFixedClock,
  WellKnownCapabilityIds,
} from "../testSupport/fixtures";

describe("supervisor-routing routing", () => {
  it("coordinates request → resolve → plan without execution", () => {
    const engine = createRoutingEngine({
      registry: createMockCapabilityRegistry(),
      clock: createFixedClock(),
    });

    const coordinated = engine.buildPlan(createRoutingRequest());
    expect(coordinated.success).toBe(true);
    expect(coordinated.plan).not.toBeNull();
    expect(coordinated.session.state).toBe(RoutingStates.COMPLETED);
    expect(coordinated.plan?.targets.map((t) => t.agentId).sort()).toEqual([
      "agent:recovery",
      "agent:workout",
    ]);
  });

  it("resolves candidate agents from capability registry only", () => {
    const engine = createRoutingEngine({
      registry: createMockCapabilityRegistry(),
      clock: createFixedClock(),
    });

    const resolution = engine.resolve(createRoutingRequest());
    expect(resolution.candidateAgentIds).toEqual([
      "agent:recovery",
      "agent:workout",
    ]);
    expect(resolution.unresolvedCapabilityIds).toEqual([]);
    expect(
      resolution.owners.map((o) => o.capabilityId).sort(),
    ).toEqual([
      WellKnownCapabilityIds.EVALUATE_RECOVERY,
      WellKnownCapabilityIds.GENERATE_WORKOUT,
    ]);
  });

  it("fails when required capabilities are missing from registry", () => {
    const engine = createRoutingEngine({
      registry: createMockCapabilityRegistry([]),
      clock: createFixedClock(),
    });

    const coordinated = engine.buildPlan(createRoutingRequest());
    expect(coordinated.success).toBe(false);
    expect(coordinated.plan).toBeNull();
    expect(coordinated.session.state).toBe(RoutingStates.FAILED);
  });
});

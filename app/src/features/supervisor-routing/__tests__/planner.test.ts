import { createRoutingPlanner } from "../planner/RoutingPlanner";
import { createRoutingResolver } from "../resolver/RoutingResolver";
import { createDependencySelector } from "../selectors/DependencySelector";
import { createCapabilitySelector } from "../selectors/CapabilitySelector";
import {
  createMockCapabilityRegistry,
  createRoutingRequest,
  createFixedClock,
  WellKnownCapabilityIds,
} from "../testSupport/fixtures";

describe("supervisor-routing planner", () => {
  it("orders steps by capability dependencies (workout before recovery)", () => {
    const registry = createMockCapabilityRegistry();
    const resolver = createRoutingResolver({
      registry,
      clock: createFixedClock(),
    });
    const request = createRoutingRequest();
    const capabilities = createCapabilitySelector().select(request);
    const dependencies = createDependencySelector().select({
      request,
      capabilities,
    });
    const resolution = resolver.resolve({ capabilities, dependencies });
    const plan = createRoutingPlanner().plan({
      request,
      resolution,
      sessionId: "session:test",
      clock: createFixedClock(),
    });

    expect(plan.steps.map((s) => s.capabilityId)).toEqual([
      WellKnownCapabilityIds.GENERATE_WORKOUT,
      WellKnownCapabilityIds.EVALUATE_RECOVERY,
    ]);
    expect(plan.executionOrder.stepIds[0]).toBe(
      `step:${WellKnownCapabilityIds.GENERATE_WORKOUT}`,
    );
    expect(plan.graph.acyclic).toBe(true);
  });

  it("produces immutable plan objects", () => {
    const registry = createMockCapabilityRegistry();
    const resolver = createRoutingResolver({
      registry,
      clock: createFixedClock(),
    });
    const request = createRoutingRequest();
    const capabilities = createCapabilitySelector().select(request);
    const dependencies = createDependencySelector().select({
      request,
      capabilities,
    });
    const resolution = resolver.resolve({ capabilities, dependencies });
    const plan = createRoutingPlanner().plan({
      request,
      resolution,
      sessionId: "session:test",
      clock: createFixedClock(),
    });

    expect(Object.isFrozen(plan)).toBe(true);
    expect(Object.isFrozen(plan.targets)).toBe(true);
    expect(Object.isFrozen(plan.graph)).toBe(true);
  });
});

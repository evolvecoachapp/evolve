import { createCapabilityRoutingPolicy } from "../policies/CapabilityRoutingPolicy";
import { createConsistencyPolicy } from "../policies/ConsistencyPolicy";
import { createDependencyPolicy } from "../policies/DependencyPolicy";
import { createExecutionPolicy } from "../policies/ExecutionPolicy";
import { createPriorityPolicy } from "../policies/PriorityPolicy";
import { createCoreRoutingPolicy } from "../policies/RoutingPolicy";
import { createRoutingEngine } from "../routing/RoutingEngine";
import {
  createMockCapabilityRegistry,
  createRoutingRequest,
  createFixedClock,
} from "../testSupport/fixtures";
import { RoutingPriorityLevels } from "../models/RoutingPriority";

describe("supervisor-routing policies", () => {
  it("applies deterministic policy rules", () => {
    expect(
      createCoreRoutingPolicy().isSatisfied(createRoutingRequest()),
    ).toBe(true);

    expect(
      createDependencyPolicy().isAcyclic(
        ["A", "B"],
        [
          {
            id: "d1",
            kind: "capability",
            fromId: "A",
            toId: "B",
            required: true,
            description: null,
          },
        ],
      ),
    ).toBe(true);

    expect(
      createPriorityPolicy().compare(
        { priority: RoutingPriorityLevels.HIGH, id: "a" },
        { priority: RoutingPriorityLevels.LOW, id: "b" },
      ),
    ).toBeLessThan(0);

    expect(
      createCapabilityRoutingPolicy().isAssignable({
        capabilityId: "X",
        agentId: "agent:x",
        enabled: true,
        name: null,
      }),
    ).toBe(true);

    expect(createExecutionPolicy().hasContiguousOrder([])).toBe(true);

    const plan = createRoutingEngine({
      registry: createMockCapabilityRegistry(),
      clock: createFixedClock(),
    }).buildPlan(createRoutingRequest()).plan!;

    expect(createConsistencyPolicy().isConsistent(plan)).toBe(true);
  });
});

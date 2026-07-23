import { RoutingPriorityLevels } from "../models/RoutingPriority";
import { createAgentSelector } from "../selectors/AgentSelector";
import { createCapabilitySelector } from "../selectors/CapabilitySelector";
import { createDependencySelector } from "../selectors/DependencySelector";
import { createPrioritySelector } from "../selectors/PrioritySelector";
import {
  createRoutingCapability,
  createRoutingRequest,
  WellKnownCapabilityIds,
} from "../testSupport/fixtures";
import { RoutingConstraintKinds } from "../models/RoutingConstraint";

describe("supervisor-routing selectors", () => {
  it("selects capabilities and derived dependencies", () => {
    const request = createRoutingRequest();
    const capabilities = createCapabilitySelector().select(request);
    const dependencies = createDependencySelector().select({
      request,
      capabilities,
    });

    expect(capabilities).toHaveLength(2);
    expect(
      dependencies.some(
        (dep) =>
          dep.fromId === WellKnownCapabilityIds.EVALUATE_RECOVERY &&
          dep.toId === WellKnownCapabilityIds.GENERATE_WORKOUT,
      ),
    ).toBe(true);
  });

  it("orders priorities by declared rank", () => {
    const priorities = createPrioritySelector().select([
      createRoutingCapability({
        capabilityId: "B",
        priority: RoutingPriorityLevels.LOW,
      }),
      createRoutingCapability({
        capabilityId: "A",
        priority: RoutingPriorityLevels.CRITICAL,
      }),
    ]);

    expect(priorities.map((p) => p.subjectId)).toEqual(["A", "B"]);
  });

  it("filters forbidden agents", () => {
    const agents = createAgentSelector().select({
      owners: [
        {
          capabilityId: "X",
          agentId: "agent:workout",
          enabled: true,
          name: null,
        },
        {
          capabilityId: "Y",
          agentId: "agent:nutrition",
          enabled: true,
          name: null,
        },
      ],
      constraints: [
        {
          id: "c1",
          kind: RoutingConstraintKinds.FORBID_AGENT,
          subjectId: null,
          value: "agent:nutrition",
          description: null,
        },
      ],
    });

    expect(agents).toEqual(["agent:workout"]);
  });
});

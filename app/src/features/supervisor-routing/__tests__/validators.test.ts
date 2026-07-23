import { createRoutingEngine } from "../routing/RoutingEngine";
import { validateDependencies } from "../validators/validateDependencies";
import { validateRoutingPlan } from "../validators/validateRoutingPlan";
import { validateRoutingRequest } from "../validators/validateRoutingRequest";
import {
  createMockCapabilityRegistry,
  createRoutingDependency,
  createRoutingRequest,
  createFixedClock,
  WellKnownCapabilityIds,
} from "../testSupport/fixtures";
import { EMPTY_ROUTING_METADATA } from "../models/RoutingMetadata";

describe("supervisor-routing validators", () => {
  it("rejects empty capability requests", () => {
    const validation = validateRoutingRequest(
      createRoutingRequest({
        requiredCapabilities: [],
      }),
    );
    expect(validation.valid).toBe(false);
  });

  it("detects dependency cycles", () => {
    const validation = validateDependencies({
      nodeIds: ["A", "B"],
      dependencies: [
        createRoutingDependency({ fromId: "A", toId: "B" }),
        createRoutingDependency({ fromId: "B", toId: "A" }),
      ],
    });
    expect(validation.valid).toBe(false);
    expect(validation.issues.some((i) => i.code === "cycle_detected")).toBe(
      true,
    );
  });

  it("validates a built routing plan", () => {
    const engine = createRoutingEngine({
      registry: createMockCapabilityRegistry(),
      clock: createFixedClock(),
    });
    const plan = engine.buildPlan(
      createRoutingRequest({
        requiredCapabilities: [
          {
            id: "cap:workout",
            capabilityId: WellKnownCapabilityIds.GENERATE_WORKOUT,
            required: true,
            priority: "high",
            dependsOn: [],
            metadata: EMPTY_ROUTING_METADATA,
          },
        ],
      }),
    ).plan!;

    expect(validateRoutingPlan(plan).valid).toBe(true);
  });
});

import {
  createAgentCapabilityService,
  registerCapability,
} from "../../agent-capability";
import {
  createWorkoutCapabilityInput,
  createNutritionCapabilityInput,
  createRecoveryCapabilityInput,
  createFixedClock as createCapabilityClock,
} from "../../agent-capability/testSupport/fixtures";
import {
  buildRoutingPlan,
  resolveRouting,
  buildRoutingSnapshot,
} from "../application";
import { createCapabilityRegistryPortFromStore } from "../contracts/CapabilityRegistryPort";
import { createSupervisorRoutingService } from "../services/SupervisorRoutingService";
import {
  createRoutingRequest,
  createFixedClock,
  WellKnownCapabilityIds,
  createRoutingCapability,
} from "../testSupport/fixtures";

describe("supervisor-routing integration", () => {
  it("consumes Agent Capability Registry for multi-agent routing plans", () => {
    const capabilityService = createAgentCapabilityService({
      registryId: "registry:capability:integration",
      clock: createCapabilityClock(),
    });
    registerCapability({
      service: capabilityService,
      input: createWorkoutCapabilityInput(),
    });
    registerCapability({
      service: capabilityService,
      input: createNutritionCapabilityInput(),
    });
    registerCapability({
      service: capabilityService,
      input: createRecoveryCapabilityInput(),
    });

    const registry = createCapabilityRegistryPortFromStore(
      capabilityService.getStore(),
    );
    const service = createSupervisorRoutingService({
      registry,
      clock: createFixedClock(),
    });

    const request = createRoutingRequest({
      requiredCapabilities: [
        createRoutingCapability({
          capabilityId: WellKnownCapabilityIds.GENERATE_WORKOUT,
          priority: "high",
        }),
        createRoutingCapability({
          capabilityId: WellKnownCapabilityIds.ANALYZE_NUTRITION,
          priority: "normal",
        }),
        createRoutingCapability({
          capabilityId: WellKnownCapabilityIds.EVALUATE_RECOVERY,
          dependsOn: [WellKnownCapabilityIds.GENERATE_WORKOUT],
          priority: "normal",
        }),
      ],
    });

    const resolved = resolveRouting({ service, request });
    expect(resolved.success).toBe(true);

    const built = buildRoutingPlan({ service, request });
    expect(built.success).toBe(true);
    expect(built.plan?.targets).toHaveLength(3);
    expect(built.plan?.graph.nodes.length).toBeGreaterThan(0);

    const workoutIndex = built.plan!.steps.find(
      (s) => s.capabilityId === WellKnownCapabilityIds.GENERATE_WORKOUT,
    )!.orderIndex;
    const recoveryIndex = built.plan!.steps.find(
      (s) => s.capabilityId === WellKnownCapabilityIds.EVALUATE_RECOVERY,
    )!.orderIndex;
    expect(workoutIndex).toBeLessThan(recoveryIndex);

    const snapshot = buildRoutingSnapshot({
      service,
      plan: built.plan!,
      request,
    });
    expect(snapshot.snapshot?.capabilityIds).toEqual([
      WellKnownCapabilityIds.ANALYZE_NUTRITION,
      WellKnownCapabilityIds.EVALUATE_RECOVERY,
      WellKnownCapabilityIds.GENERATE_WORKOUT,
    ]);
  });

  it("keeps public surface free of execution / AI APIs", () => {
    const api = require("../index") as Record<string, unknown>;
    expect(typeof api.buildRoutingPlan).toBe("function");
    expect(typeof api.resolveRouting).toBe("function");
    expect(typeof api.validateRoutingPlan).toBe("function");
    expect(typeof api.describeRouting).toBe("function");
    expect(typeof api.buildRoutingSnapshot).toBe("function");
    expect(api.executeCollaboration).toBeUndefined();
    expect(api.executeAgent).toBeUndefined();
    expect(api.processCoachRequest).toBeUndefined();
  });
});

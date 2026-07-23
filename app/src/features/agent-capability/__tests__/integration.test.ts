import {
  registerCapability,
  resolveCapability,
  findCapabilities,
  buildCapabilitySnapshot,
  validateRegistry,
} from "../application";
import { WellKnownCapabilityIds } from "../models/CapabilityId";
import {
  createTestCapabilityService,
  createWorkoutCapabilityInput,
  createNutritionCapabilityInput,
  createRecoveryCapabilityInput,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";

describe("agent-capability integration", () => {
  it("supports foundation lifecycle: register specialists → resolve by capability → snapshot", () => {
    const service = createTestCapabilityService();

    expect(
      registerCapability({
        service,
        input: createWorkoutCapabilityInput(),
      }).success,
    ).toBe(true);
    expect(
      registerCapability({
        service,
        input: createNutritionCapabilityInput(),
      }).success,
    ).toBe(true);
    expect(
      registerCapability({
        service,
        input: createRecoveryCapabilityInput(),
      }).success,
    ).toBe(true);

    // Future Coach path: capability → owner → collaboration (not wired yet)
    const workout = resolveCapability({
      service,
      capabilityId: WellKnownCapabilityIds.GENERATE_WORKOUT,
    });
    const nutrition = resolveCapability({
      service,
      capabilityId: WellKnownCapabilityIds.ANALYZE_NUTRITION,
    });
    const recovery = resolveCapability({
      service,
      capabilityId: WellKnownCapabilityIds.EVALUATE_RECOVERY,
    });

    expect([
      workout.ownerAgentId,
      nutrition.ownerAgentId,
      recovery.ownerAgentId,
    ]).toEqual(["agent:workout", "agent:nutrition", "agent:recovery"]);

    const listed = findCapabilities({ service, enabledOnly: true });
    expect(listed.collection?.count).toBe(3);

    const snapshot = buildCapabilitySnapshot({ service });
    expect(snapshot.snapshot?.createdAt).toBe(FIXED_TIMESTAMP);
    expect(snapshot.snapshot?.capabilityIds).toEqual([
      WellKnownCapabilityIds.ANALYZE_NUTRITION,
      WellKnownCapabilityIds.EVALUATE_RECOVERY,
      WellKnownCapabilityIds.GENERATE_WORKOUT,
    ]);

    expect(validateRegistry({ service }).success).toBe(true);
  });

  it("keeps Coach Agent / Collaboration untouched (foundation-only)", () => {
    // This module must not import coach-agent or agent-collaboration.
    // Architectural boundary check via public API surface only.
    const api = require("../index") as Record<string, unknown>;
    expect(typeof api.registerCapability).toBe("function");
    expect(typeof api.resolveCapability).toBe("function");
    expect(typeof api.findCapability).toBe("function");
    expect(typeof api.findCapabilities).toBe("function");
    expect(typeof api.buildCapabilitySnapshot).toBe("function");
    expect(typeof api.validateRegistry).toBe("function");
    expect(api.executeCollaboration).toBeUndefined();
    expect(api.processCoachRequest).toBeUndefined();
  });
});

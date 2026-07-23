import {
  registerCapability,
  resolveCapability,
  findCapability,
  findCapabilities,
  buildCapabilitySnapshot,
  validateRegistry,
} from "../application";
import { WellKnownCapabilityIds } from "../models/CapabilityId";
import { CapabilityOperationKinds } from "../models/CapabilityResult";
import {
  createTestCapabilityService,
  createWorkoutCapabilityInput,
  createNutritionCapabilityInput,
  createRecoveryCapabilityInput,
} from "../testSupport/fixtures";

describe("agent-capability application", () => {
  it("exposes public API for register → resolve → find → snapshot → validate", () => {
    const service = createTestCapabilityService();

    const registered = registerCapability({
      service,
      input: createWorkoutCapabilityInput(),
    });
    expect(registered.success).toBe(true);
    expect(registered.operation).toBe(CapabilityOperationKinds.REGISTER);

    registerCapability({
      service,
      input: createNutritionCapabilityInput(),
    });
    registerCapability({
      service,
      input: createRecoveryCapabilityInput(),
    });

    const resolved = resolveCapability({
      service,
      capabilityId: WellKnownCapabilityIds.GENERATE_WORKOUT,
    });
    expect(resolved.success).toBe(true);
    expect(resolved.ownerAgentId).toBe("agent:workout");
    expect(resolved.operation).toBe(CapabilityOperationKinds.RESOLVE);

    const found = findCapability({
      service,
      capabilityId: WellKnownCapabilityIds.ANALYZE_NUTRITION,
    });
    expect(found.success).toBe(true);

    const listed = findCapabilities({ service });
    expect(listed.collection?.count).toBe(3);

    const snapshot = buildCapabilitySnapshot({
      service,
      snapshotId: "snapshot:public",
    });
    expect(snapshot.success).toBe(true);
    expect(snapshot.snapshot?.capabilityCount).toBe(3);
    expect(snapshot.snapshot?.agentIds).toEqual([
      "agent:nutrition",
      "agent:recovery",
      "agent:workout",
    ]);

    const validated = validateRegistry({ service });
    expect(validated.success).toBe(true);
    expect(validated.operation).toBe(CapabilityOperationKinds.VALIDATE);
  });

  it("does not couple Coach to concrete specialist agent names for resolution", () => {
    const service = createTestCapabilityService();
    registerCapability({
      service,
      input: createRecoveryCapabilityInput(),
    });

    // Coach asks for a capability — not "Recovery Agent"
    const resolved = resolveCapability({
      service,
      capabilityId: WellKnownCapabilityIds.EVALUATE_RECOVERY,
    });

    expect(resolved.resolution?.requestedCapabilityId).toBe(
      WellKnownCapabilityIds.EVALUATE_RECOVERY,
    );
    expect(resolved.ownerAgentId).toBe("agent:recovery");
  });
});

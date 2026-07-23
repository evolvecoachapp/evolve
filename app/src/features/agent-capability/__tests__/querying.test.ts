import { WellKnownCapabilityIds } from "../models/CapabilityId";
import { CapabilityQueryKinds } from "../models/CapabilityQuery";
import { EMPTY_CAPABILITY_METADATA } from "../models/CapabilityMetadata";
import {
  createTestCapabilityService,
  seedSpecialistCapabilities,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";

describe("agent-capability querying", () => {
  it("finds capability, owner, and existence", () => {
    const service = createTestCapabilityService();
    seedSpecialistCapabilities(service);

    const found = service.findCapability(
      WellKnownCapabilityIds.ANALYZE_NUTRITION,
    );
    expect(found.success).toBe(true);
    expect(found.ownerAgentId).toBe("agent:nutrition");

    const owner = service.findOwner(WellKnownCapabilityIds.EVALUATE_RECOVERY);
    expect(owner.ownerAgentId).toBe("agent:recovery");

    const exists = service.capabilityExists(
      WellKnownCapabilityIds.GENERATE_WORKOUT,
    );
    expect(exists.exists).toBe(true);

    const missing = service.capabilityExists("DoesNotExist");
    expect(missing.exists).toBe(false);
  });

  it("lists all and agent-scoped capabilities", () => {
    const service = createTestCapabilityService();
    seedSpecialistCapabilities(service);

    const all = service.findCapabilities();
    expect(all.collection?.count).toBe(3);

    const workoutOnly = service.findCapabilities({
      agentId: "agent:workout",
    });
    expect(workoutOnly.collection?.count).toBe(1);
    expect(workoutOnly.collection?.registrations[0].capabilityId).toBe(
      WellKnownCapabilityIds.GENERATE_WORKOUT,
    );
  });

  it("executes typed capability queries", () => {
    const service = createTestCapabilityService();
    seedSpecialistCapabilities(service);

    const result = service.query({
      id: "query:1",
      kind: CapabilityQueryKinds.LIST_CAPABILITIES,
      capabilityId: null,
      agentId: null,
      enabledOnly: true,
      metadata: EMPTY_CAPABILITY_METADATA,
      createdAt: FIXED_TIMESTAMP,
    });

    expect(result.success).toBe(true);
    expect(result.collection?.count).toBe(3);
  });
});

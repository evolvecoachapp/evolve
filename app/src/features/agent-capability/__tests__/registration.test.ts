import { WellKnownCapabilityIds } from "../models/CapabilityId";
import {
  createTestCapabilityService,
  createWorkoutCapabilityInput,
  seedSpecialistCapabilities,
} from "../testSupport/fixtures";

describe("agent-capability registration", () => {
  it("registers immutable capability bindings", () => {
    const service = createTestCapabilityService();
    const result = service.registerCapability(createWorkoutCapabilityInput());

    expect(result.success).toBe(true);
    expect(result.registration?.capabilityId).toBe(
      WellKnownCapabilityIds.GENERATE_WORKOUT,
    );
    expect(result.registration?.agentId).toBe("agent:workout");
    expect(Object.isFrozen(result.registration)).toBe(true);
    expect(Object.isFrozen(result)).toBe(true);
  });

  it("rejects duplicate capability registrations", () => {
    const service = createTestCapabilityService();
    service.registerCapability(createWorkoutCapabilityInput());
    const duplicate = service.registerCapability(
      createWorkoutCapabilityInput({
        agentId: "agent:other",
      }),
    );

    expect(duplicate.success).toBe(false);
    expect(duplicate.error?.code).toBe("duplicate_capability");
  });

  it("rejects invalid registrations", () => {
    const service = createTestCapabilityService();
    const invalid = service.registerCapability({
      capabilityId: "",
      agentId: "",
      supportedOperations: [],
    });

    expect(invalid.success).toBe(false);
    expect(invalid.validation.valid).toBe(false);
  });

  it("allows multiple distinct capabilities", () => {
    const service = createTestCapabilityService();
    seedSpecialistCapabilities(service);
    const listed = service.findCapabilities();
    expect(listed.collection?.count).toBe(3);
    expect(
      listed.collection?.registrations.map((item) => item.capabilityId),
    ).toEqual([
      WellKnownCapabilityIds.ANALYZE_NUTRITION,
      WellKnownCapabilityIds.EVALUATE_RECOVERY,
      WellKnownCapabilityIds.GENERATE_WORKOUT,
    ]);
  });
});

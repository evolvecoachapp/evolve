import {
  validateCapabilityId,
  validateDescriptor,
  validateRegistration,
  validateDuplicates,
  validateRegistryConsistency,
} from "../validators";
import { CapabilityValidationCodes } from "../models/CapabilityValidation";
import { buildCapabilityDescriptor } from "../builders/CapabilityDescriptorBuilder";
import {
  createFrozenRegistration,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";
import { WellKnownCapabilityIds } from "../models/CapabilityId";

describe("agent-capability validators", () => {
  it("validates capability identifiers", () => {
    expect(validateCapabilityId("GenerateWorkout").valid).toBe(true);
    expect(validateCapabilityId("").valid).toBe(false);
    expect(validateCapabilityId("1Bad").valid).toBe(false);
  });

  it("validates descriptors and registrations", () => {
    const descriptor = buildCapabilityDescriptor({
      id: WellKnownCapabilityIds.GENERATE_WORKOUT,
      name: "Generate Workout",
      description: "desc",
      supportedOperations: ["generate"],
    });
    expect(validateDescriptor(descriptor).valid).toBe(true);
    expect(validateDescriptor(null).valid).toBe(false);

    const registration = createFrozenRegistration();
    expect(validateRegistration(registration).valid).toBe(true);
    expect(validateRegistration(null).valid).toBe(false);
  });

  it("detects duplicates and registry inconsistencies", () => {
    const first = createFrozenRegistration();
    const second = createFrozenRegistration({
      id: "registration:2",
      agentId: "agent:other",
    });

    const duplicates = validateDuplicates([first], second);
    expect(duplicates.valid).toBe(false);
    expect(duplicates.issues[0].code).toBe(
      CapabilityValidationCodes.DUPLICATE_CAPABILITY,
    );

    const consistent = validateRegistryConsistency([first]);
    expect(consistent.valid).toBe(true);

    const inconsistent = validateRegistryConsistency([
      {
        ...first,
        descriptor: {
          ...first.descriptor,
          id: "Mismatch",
        },
        registeredAt: FIXED_TIMESTAMP,
      },
    ]);
    expect(inconsistent.valid).toBe(false);
  });
});

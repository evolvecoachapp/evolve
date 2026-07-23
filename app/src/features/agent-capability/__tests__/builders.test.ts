import {
  buildCapabilityDescriptor,
  buildCapabilityRegistration,
  buildCapabilityRegistry,
  buildCapabilityResolution,
  buildCapabilitySnapshotFromInput,
} from "../builders";
import { WellKnownCapabilityIds } from "../models/CapabilityId";
import { FIXED_TIMESTAMP } from "../testSupport/fixtures";

describe("agent-capability builders", () => {
  it("builds immutable descriptor, registration, registry, resolution, snapshot", () => {
    const descriptor = buildCapabilityDescriptor({
      id: WellKnownCapabilityIds.GENERATE_WORKOUT,
      name: "Generate Workout",
      description: "Generate workouts",
      category: "workout",
      supportedOperations: ["generate"],
    });
    expect(Object.isFrozen(descriptor)).toBe(true);

    const registration = buildCapabilityRegistration({
      id: "registration:1",
      capabilityId: WellKnownCapabilityIds.GENERATE_WORKOUT,
      agentId: "agent:workout",
      descriptor,
      registeredAt: FIXED_TIMESTAMP,
    });
    expect(Object.isFrozen(registration)).toBe(true);

    const registry = buildCapabilityRegistry({
      id: "registry:1",
      registrations: [registration],
      createdAt: FIXED_TIMESTAMP,
    });
    expect(registry.capabilityCount).toBe(1);
    expect(registry.agentCount).toBe(1);
    expect(Object.isFrozen(registry)).toBe(true);

    const resolution = buildCapabilityResolution({
      id: "resolution:1",
      requestedCapabilityId: WellKnownCapabilityIds.GENERATE_WORKOUT,
      matches: [
        {
          capabilityId: WellKnownCapabilityIds.GENERATE_WORKOUT,
          agentId: "agent:workout",
          registration,
          exact: true,
        },
      ],
      resolvedAt: FIXED_TIMESTAMP,
    });
    expect(resolution.found).toBe(true);
    expect(resolution.ownerAgentId).toBe("agent:workout");

    const snapshot = buildCapabilitySnapshotFromInput({
      id: "snapshot:1",
      registry,
      createdAt: FIXED_TIMESTAMP,
    });
    expect(snapshot.capabilityIds).toEqual([
      WellKnownCapabilityIds.GENERATE_WORKOUT,
    ]);
    expect(Object.isFrozen(snapshot)).toBe(true);
  });
});

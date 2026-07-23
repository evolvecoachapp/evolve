import {
  createDuplicateHandlingPolicy,
  DuplicateHandlingModes,
  createCapabilityOwnershipPolicy,
  createCapabilityUniquenessPolicy,
  createRegistryConsistencyPolicy,
} from "../policies";
import {
  createFrozenRegistration,
} from "../testSupport/fixtures";
import { WellKnownCapabilityIds } from "../models/CapabilityId";

describe("agent-capability policies", () => {
  it("rejects duplicates by default and can ignore them", () => {
    const rejectPolicy = createDuplicateHandlingPolicy(
      DuplicateHandlingModes.REJECT,
    );
    const existing = [createFrozenRegistration()];
    const candidate = createFrozenRegistration({
      id: "registration:2",
      agentId: "agent:other",
    });

    const rejected = rejectPolicy.apply(existing, candidate);
    expect(rejected.accepted).toBe(false);

    const ignorePolicy = createDuplicateHandlingPolicy(
      DuplicateHandlingModes.IGNORE,
    );
    const ignored = ignorePolicy.apply(existing, candidate);
    expect(ignored.accepted).toBe(false);
    expect(ignored.registrations).toHaveLength(1);
  });

  it("enforces ownership and uniqueness", () => {
    const ownership = createCapabilityOwnershipPolicy();
    const uniqueness = createCapabilityUniquenessPolicy();
    const registrations = [
      createFrozenRegistration(),
      createFrozenRegistration({
        id: "registration:nutrition",
        capabilityId: WellKnownCapabilityIds.ANALYZE_NUTRITION,
        agentId: "agent:nutrition",
        name: "Analyze Nutrition",
        description: "Analyze nutrition",
        supportedOperations: ["analyze"],
      }),
    ];

    expect(
      ownership.assertOwner(
        registrations,
        WellKnownCapabilityIds.GENERATE_WORKOUT,
      ),
    ).toBe("agent:workout");
    expect(
      uniqueness.isUnique(
        registrations,
        WellKnownCapabilityIds.GENERATE_WORKOUT,
      ),
    ).toBe(true);
    expect(
      uniqueness.findDuplicates([
        ...registrations,
        createFrozenRegistration({ id: "dup" }),
      ]),
    ).toEqual([WellKnownCapabilityIds.GENERATE_WORKOUT]);
  });

  it("checks registry consistency", () => {
    const policy = createRegistryConsistencyPolicy();
    const ok = policy.check([createFrozenRegistration()]);
    expect(ok.valid).toBe(true);

    const bad = policy.check([
      createFrozenRegistration(),
      createFrozenRegistration({ id: "dup", agentId: "agent:other" }),
    ]);
    expect(bad.valid).toBe(false);
  });
});

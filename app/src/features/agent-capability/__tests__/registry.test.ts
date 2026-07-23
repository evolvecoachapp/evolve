import { WellKnownCapabilityIds } from "../models/CapabilityId";
import { createCapabilityRegistryStore } from "../registry/CapabilityRegistryStore";
import {
  createFrozenRegistration,
  createFixedClock,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";

describe("agent-capability registry", () => {
  it("registers, looks up, and snapshots deterministically", () => {
    const store = createCapabilityRegistryStore({
      registryId: "registry:test",
      clock: createFixedClock(),
    });

    const workout = createFrozenRegistration();
    const outcome = store.register(workout);

    expect(outcome.accepted).toBe(true);
    expect(store.has(WellKnownCapabilityIds.GENERATE_WORKOUT)).toBe(true);
    expect(store.lookup(WellKnownCapabilityIds.GENERATE_WORKOUT)?.agentId).toBe(
      "agent:workout",
    );
    expect(Object.isFrozen(store.lookup(WellKnownCapabilityIds.GENERATE_WORKOUT))).toBe(
      true,
    );

    const registry = store.toRegistry();
    expect(registry.id).toBe("registry:test");
    expect(registry.capabilityCount).toBe(1);
    expect(registry.createdAt).toBe(FIXED_TIMESTAMP);
    expect(Object.isFrozen(registry)).toBe(true);
  });

  it("rejects duplicate capability ids by default", () => {
    const store = createCapabilityRegistryStore({
      clock: createFixedClock(),
    });
    store.register(createFrozenRegistration());
    const second = store.register(
      createFrozenRegistration({
        id: "registration:duplicate",
        capabilityId: WellKnownCapabilityIds.GENERATE_WORKOUT,
        agentId: "agent:other",
      }),
    );

    expect(second.accepted).toBe(false);
    expect(store.size()).toBe(1);
    expect(store.lookup(WellKnownCapabilityIds.GENERATE_WORKOUT)?.agentId).toBe(
      "agent:workout",
    );
  });

  it("lists agent capabilities sorted by capabilityId", () => {
    const store = createCapabilityRegistryStore({
      clock: createFixedClock(),
    });
    store.register(
      createFrozenRegistration({
        capabilityId: "ZuluCapability",
        agentId: "agent:a",
        name: "Zulu",
        description: "Zulu",
        supportedOperations: ["run"],
      }),
    );
    store.register(
      createFrozenRegistration({
        capabilityId: "AlphaCapability",
        agentId: "agent:a",
        name: "Alpha",
        description: "Alpha",
        supportedOperations: ["run"],
      }),
    );

    const listed = store.findByAgent("agent:a");
    expect(listed.map((item) => item.capabilityId)).toEqual([
      "AlphaCapability",
      "ZuluCapability",
    ]);
  });
});

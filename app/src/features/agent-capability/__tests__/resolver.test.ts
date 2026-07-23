import { WellKnownCapabilityIds } from "../models/CapabilityId";
import { CapabilityValidationCodes } from "../models/CapabilityValidation";
import { createCapabilityRegistryStore } from "../registry/CapabilityRegistryStore";
import { createCapabilityResolver } from "../resolver/CapabilityResolver";
import {
  createFixedClock,
  createFrozenRegistration,
} from "../testSupport/fixtures";

describe("agent-capability resolver", () => {
  it("resolves exact capability matches without ranking", () => {
    const store = createCapabilityRegistryStore({
      clock: createFixedClock(),
    });
    store.register(createFrozenRegistration());
    const resolver = createCapabilityResolver({
      store,
      clock: createFixedClock(),
    });

    const resolution = resolver.resolve(WellKnownCapabilityIds.GENERATE_WORKOUT);
    expect(resolution.found).toBe(true);
    expect(resolution.ownerAgentId).toBe("agent:workout");
    expect(resolution.matches).toHaveLength(1);
    expect(resolution.matches[0].exact).toBe(true);
    expect(Object.isFrozen(resolution)).toBe(true);
  });

  it("returns deterministic not-found for missing capabilities", () => {
    const store = createCapabilityRegistryStore({
      clock: createFixedClock(),
    });
    const resolver = createCapabilityResolver({
      store,
      clock: createFixedClock(),
    });

    const resolution = resolver.resolve("MissingCapability");
    expect(resolution.found).toBe(false);
    expect(resolution.ownerAgentId).toBeNull();
    expect(resolution.validation.valid).toBe(false);
    expect(resolution.validation.issues[0].code).toBe(
      CapabilityValidationCodes.NOT_FOUND,
    );
  });

  it("does not resolve disabled capabilities", () => {
    const store = createCapabilityRegistryStore({
      clock: createFixedClock(),
    });
    store.register(
      createFrozenRegistration({
        enabled: false,
      }),
    );
    const resolver = createCapabilityResolver({
      store,
      clock: createFixedClock(),
    });

    const resolution = resolver.resolve(WellKnownCapabilityIds.GENERATE_WORKOUT);
    expect(resolution.found).toBe(false);
    expect(resolution.validation.issues[0].code).toBe(
      CapabilityValidationCodes.DISABLED,
    );
  });
});

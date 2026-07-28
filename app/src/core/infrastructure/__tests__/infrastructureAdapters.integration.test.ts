import {
  createCompositionRoot,
  resetCompositionRoot,
} from "../../composition/createCompositionRoot";
import {
  AdapterCapabilityError,
  AdapterNotFoundError,
  AdapterRegistrationError,
  AdapterValidationError,
  UnsupportedAdapterError,
} from "../errors";
import {
  ADAPTER_TOKENS,
  createAdapterCapabilities,
  createAdapterMetadata,
  createAdapterRegistration,
  createAdapterRegistry,
  createAdapterResult,
  createInfrastructureAdapterRegistry,
  getAdapterCapabilities,
  getAdapterRegistry,
  getRegisteredAdapters,
  INFRASTRUCTURE_ADAPTER_CONTRACT_VERSION,
  validateAdapters,
} from "../index";
import {
  createEmptyInfrastructureAdapterRegistry,
  createTestInfrastructureAdapterRegistry,
  FIXED_INFRASTRUCTURE_ADAPTER_TIMESTAMP,
} from "../testSupport/fixtures";

describe("Infrastructure Adapter Contracts integration (Sprint 29.4)", () => {
  afterEach(() => {
    resetCompositionRoot();
  });

  it("registers all canonical adapter contracts by default", () => {
    const registry = createTestInfrastructureAdapterRegistry();
    const tokens = registry.getAdapterRegistry().tokens();

    expect(tokens).toEqual([...ADAPTER_TOKENS]);
    expect(registry.getAdapterRegistry().has("storage")).toBe(true);
    expect(registry.getAdapterRegistry().resolve("authentication")?.name).toBe(
      "AuthenticationAdapter",
    );
  });

  it("validates complete default adapters as valid", () => {
    const validation = validateAdapters({
      registry: createTestInfrastructureAdapterRegistry(),
    });

    expect(validation.valid).toBe(true);
    expect(validation.errors).toEqual([]);
    expect(Object.isFrozen(validation)).toBe(true);
    expect(Object.isFrozen(validation.errors)).toBe(true);
  });

  it("detects missing adapters", () => {
    const registry = createEmptyInfrastructureAdapterRegistry();
    const validation = registry.validate();

    expect(validation.valid).toBe(false);
    expect(
      validation.errors.some((e) => e.includes("Missing adapter: storage")),
    ).toBe(true);
    expect(
      validation.errors.some((e) =>
        e.includes("Missing adapter: authentication"),
      ),
    ).toBe(true);
  });

  it("rejects duplicate adapter registrations", () => {
    const registry = createAdapterRegistry();
    const registration = createAdapterRegistration({
      token: "storage",
      name: "StorageAdapter",
      version: "1.0.0",
      capabilities: ["supportsOffline"],
      metadata: Object.freeze({ layer: "test" }),
    });

    registry.register(registration);
    expect(() => registry.register(registration)).toThrow(
      AdapterRegistrationError,
    );
  });

  it("rejects invalid metadata on adapter registration", () => {
    const registry = createAdapterRegistry();

    expect(() =>
      registry.register(
        createAdapterRegistration({
          token: "logging",
          name: "   ",
          version: "1.0.0",
          capabilities: ["supportsOffline"],
          metadata: Object.freeze({}),
        }),
      ),
    ).toThrow(AdapterValidationError);
  });

  it("rejects unsupported capabilities", () => {
    const registry = createAdapterRegistry();

    expect(() =>
      registry.register({
        token: "storage",
        name: "StorageAdapter",
        version: "1.0.0",
        capabilities: createAdapterCapabilities([
          "telepathy" as "supportsOffline",
        ]),
        metadata: createAdapterMetadata({}),
      }),
    ).toThrow(AdapterValidationError);
  });

  it("rejects invalid version metadata", () => {
    const registry = createAdapterRegistry();

    expect(() =>
      registry.register(
        createAdapterRegistration({
          token: "media",
          name: "MediaAdapter",
          version: "",
          capabilities: ["supportsMedia"],
          metadata: Object.freeze({}),
        }),
      ),
    ).toThrow(AdapterValidationError);
  });

  it("exposes application APIs for registry, adapters, and capabilities", () => {
    const registry = createTestInfrastructureAdapterRegistry();
    const adapterRegistry = getAdapterRegistry({ registry });
    const adapters = getRegisteredAdapters({ registry });
    const storageCaps = getAdapterCapabilities({
      token: "storage",
      registry,
    });
    const view = registry.getAdaptersView();

    expect(view.version).toBe(INFRASTRUCTURE_ADAPTER_CONTRACT_VERSION);
    expect(view.generatedAt).toBe(FIXED_INFRASTRUCTURE_ADAPTER_TIMESTAMP);
    expect(adapters).toHaveLength(ADAPTER_TOKENS.length);
    expect(adapterRegistry.list()).toHaveLength(ADAPTER_TOKENS.length);
    expect(storageCaps).toEqual(
      expect.arrayContaining([
        "supportsTransactions",
        "supportsOffline",
        "supportsEncryption",
      ]),
    );
    expect(Object.isFrozen(view)).toBe(true);
    expect(Object.isFrozen(adapters)).toBe(true);
  });

  it("enforces immutability on registrations and helper models", () => {
    const registry = createTestInfrastructureAdapterRegistry();
    const storage = registry.getAdapterRegistry().resolve("storage")!;
    const result = createAdapterResult({ success: true, value: "ok" });
    const capabilities = createAdapterCapabilities(["supportsPush"]);
    const metadata = createAdapterMetadata({ layer: "test" });

    expect(Object.isFrozen(storage)).toBe(true);
    expect(Object.isFrozen(storage.capabilities)).toBe(true);
    expect(Object.isFrozen(storage.capabilities.items)).toBe(true);
    expect(Object.isFrozen(storage.metadata)).toBe(true);
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(capabilities)).toBe(true);
    expect(Object.isFrozen(metadata)).toBe(true);

    const before = storage.name;
    try {
      (storage as { name: string }).name = "mutated";
    } catch {
      // Strict mode may throw.
    }
    expect(storage.name).toBe(before);
  });

  it("creates immutable error models", () => {
    const notFound = new AdapterNotFoundError("storage");
    const capability = new AdapterCapabilityError("storage", "supportsPush");
    const registration = new AdapterRegistrationError("storage");
    const validation = new AdapterValidationError(["missing adapter"]);
    const unsupported = new UnsupportedAdapterError("unknown");

    expect(notFound.code).toBe("adapter_not_found");
    expect(capability.code).toBe("adapter_capability_error");
    expect(registration.code).toBe("adapter_registration_error");
    expect(validation.code).toBe("adapter_validation_error");
    expect(unsupported.code).toBe("unsupported_adapter");

    expect(Object.isFrozen(notFound)).toBe(true);
    expect(Object.isFrozen(capability)).toBe(true);
    expect(Object.isFrozen(registration)).toBe(true);
    expect(Object.isFrozen(validation)).toBe(true);
    expect(Object.isFrozen(unsupported)).toBe(true);
    expect(Object.isFrozen(notFound.details)).toBe(true);
    expect(Object.isFrozen(validation.issues)).toBe(true);
  });

  it("registers infrastructure adapter registry in composition root", () => {
    const root = createCompositionRoot();
    const infrastructure = root.resolve("InfrastructureAdapterRegistry");

    expect(infrastructure).toBeDefined();
    expect(root.getInfrastructureAdapterRegistry()).toBe(infrastructure);
    expect(infrastructure.validate().valid).toBe(true);
    expect(infrastructure.getRegisteredAdapters()).toHaveLength(
      ADAPTER_TOKENS.length,
    );
  });

  it("composition root adapters match application API defaults", () => {
    const root = createCompositionRoot();
    const fromRoot = root.getInfrastructureAdapterRegistry().getAdaptersView();
    const fromApi = createInfrastructureAdapterRegistry({
      clock: () => fromRoot.generatedAt,
    }).getAdaptersView();

    expect(fromRoot.adapters.map((a) => a.token)).toEqual(
      fromApi.adapters.map((a) => a.token),
    );
    expect(fromRoot.adapters.map((a) => a.name)).toEqual(
      fromApi.adapters.map((a) => a.name),
    );
  });
});

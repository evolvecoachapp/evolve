import {
  createCompositionRoot,
  resetCompositionRoot,
} from "../../composition/createCompositionRoot";
import {
  ContractViolationError,
  RepositoryNotFoundError,
  StorageUnavailableError,
  TransactionFailureError,
  ValidationError,
} from "../errors";
import {
  createPersistenceContractRegistry,
  createRepositoryRegistry,
  createStorageContractRegistry,
  createStorageMetadata,
  createStorageResult,
  createStorageSession,
  getPersistenceContracts,
  getRepositoryRegistry,
  PERSISTENCE_CONTRACT_VERSION,
  REPOSITORY_TOKENS,
  STORAGE_PORT_TOKENS,
  validatePersistenceContracts,
} from "../index";
import {
  createEmptyPersistenceRegistry,
  createTestPersistenceRegistry,
  FIXED_PERSISTENCE_TIMESTAMP,
} from "../testSupport/fixtures";

describe("Persistence Contract Foundation integration (Sprint 29.3)", () => {
  afterEach(() => {
    resetCompositionRoot();
  });

  it("registers all canonical repository contracts by default", () => {
    const registry = createTestPersistenceRegistry();
    const tokens = registry.getRepositoryRegistry().tokens();

    expect(tokens).toEqual([...REPOSITORY_TOKENS]);
    expect(registry.getRepositoryRegistry().has("athlete")).toBe(true);
    expect(registry.getRepositoryRegistry().resolve("identity")?.name).toBe(
      "IdentityRepository",
    );
  });

  it("registers all canonical storage port contracts by default", () => {
    const registry = createTestPersistenceRegistry();
    const tokens = registry.getStorageContractRegistry().tokens();

    expect(tokens).toEqual([...STORAGE_PORT_TOKENS]);
    expect(registry.getStorageContractRegistry().has("storage-reader")).toBe(
      true,
    );
  });

  it("validates complete default contracts as valid", () => {
    const validation = validatePersistenceContracts({
      registry: createTestPersistenceRegistry(),
    });

    expect(validation.valid).toBe(true);
    expect(validation.errors).toEqual([]);
    expect(Object.isFrozen(validation)).toBe(true);
    expect(Object.isFrozen(validation.errors)).toBe(true);
  });

  it("detects missing repository contracts", () => {
    const registry = createEmptyPersistenceRegistry();
    const validation = registry.validate();

    expect(validation.valid).toBe(false);
    expect(
      validation.errors.some((e) =>
        e.includes("Missing repository contract: athlete"),
      ),
    ).toBe(true);
  });

  it("detects missing storage contracts", () => {
    const registry = createEmptyPersistenceRegistry();
    const validation = registry.validate();

    expect(validation.valid).toBe(false);
    expect(
      validation.errors.some((e) =>
        e.includes("Missing storage contract: storage-reader"),
      ),
    ).toBe(true);
  });

  it("rejects duplicate repository registrations", () => {
    const registry = createRepositoryRegistry();
    const descriptor = {
      token: "athlete" as const,
      name: "AthleteRepository",
      version: "1.0.0",
      capabilities: ["read"] as const,
      metadata: Object.freeze({ layer: "test" }),
    };

    registry.register(descriptor);
    expect(() => registry.register(descriptor)).toThrow(ContractViolationError);
  });

  it("rejects duplicate storage contract registrations", () => {
    const registry = createStorageContractRegistry();
    const descriptor = {
      token: "storage-reader" as const,
      name: "StorageReader",
      version: "1.0.0",
      capabilities: ["read"] as const,
      metadata: Object.freeze({ layer: "test" }),
    };

    registry.register(descriptor);
    expect(() => registry.register(descriptor)).toThrow(ContractViolationError);
  });

  it("rejects invalid metadata on repository registration", () => {
    const registry = createRepositoryRegistry();

    expect(() =>
      registry.register({
        token: "athlete",
        name: "   ",
        version: "1.0.0",
        capabilities: ["read"],
        metadata: Object.freeze({}),
      }),
    ).toThrow(ValidationError);
  });

  it("rejects unsupported capabilities", () => {
    const registry = createRepositoryRegistry();

    expect(() =>
      registry.register({
        token: "athlete",
        name: "AthleteRepository",
        version: "1.0.0",
        capabilities: ["telepathy" as "read"],
        metadata: Object.freeze({}),
      }),
    ).toThrow(ValidationError);
  });

  it("rejects invalid storage metadata", () => {
    const registry = createStorageContractRegistry();

    expect(() =>
      registry.register({
        token: "storage-writer",
        name: "StorageWriter",
        version: "",
        capabilities: ["write"],
        metadata: Object.freeze({}),
      }),
    ).toThrow(ValidationError);
  });

  it("exposes application APIs for contracts and registry", () => {
    const registry = createTestPersistenceRegistry();
    const contracts = getPersistenceContracts({ registry });
    const repositories = getRepositoryRegistry({ registry });

    expect(contracts.version).toBe(PERSISTENCE_CONTRACT_VERSION);
    expect(contracts.generatedAt).toBe(FIXED_PERSISTENCE_TIMESTAMP);
    expect(contracts.repositories).toHaveLength(REPOSITORY_TOKENS.length);
    expect(contracts.storagePorts).toHaveLength(STORAGE_PORT_TOKENS.length);
    expect(repositories.list()).toHaveLength(REPOSITORY_TOKENS.length);
    expect(Object.isFrozen(contracts)).toBe(true);
    expect(Object.isFrozen(contracts.repositories)).toBe(true);
  });

  it("enforces immutability on contract descriptors and storage helpers", () => {
    const registry = createTestPersistenceRegistry();
    const athlete = registry.getRepositoryRegistry().resolve("athlete")!;
    const metadata = createStorageMetadata({
      backendId: "contract-only",
      version: "1.0.0",
      capabilities: ["read"],
      createdAt: FIXED_PERSISTENCE_TIMESTAMP,
    });
    const session = createStorageSession({
      sessionId: "session:1",
      startedAt: FIXED_PERSISTENCE_TIMESTAMP,
    });
    const result = createStorageResult({ success: true, value: "ok" });

    expect(Object.isFrozen(athlete)).toBe(true);
    expect(Object.isFrozen(athlete.capabilities)).toBe(true);
    expect(Object.isFrozen(athlete.metadata)).toBe(true);
    expect(Object.isFrozen(metadata)).toBe(true);
    expect(Object.isFrozen(session)).toBe(true);
    expect(Object.isFrozen(result)).toBe(true);

    const before = athlete.name;
    try {
      (athlete as { name: string }).name = "mutated";
    } catch {
      // Strict mode may throw.
    }
    expect(athlete.name).toBe(before);
  });

  it("creates immutable error models", () => {
    const notFound = new RepositoryNotFoundError("athlete");
    const unavailable = new StorageUnavailableError("sqlite");
    const violation = new ContractViolationError("athlete");
    const txFailure = new TransactionFailureError("session:1");
    const validation = new ValidationError(["missing contract"]);

    expect(notFound.code).toBe("repository_not_found");
    expect(unavailable.code).toBe("storage_unavailable");
    expect(violation.code).toBe("contract_violation");
    expect(txFailure.code).toBe("transaction_failure");
    expect(validation.code).toBe("validation_error");

    expect(Object.isFrozen(notFound)).toBe(true);
    expect(Object.isFrozen(unavailable)).toBe(true);
    expect(Object.isFrozen(violation)).toBe(true);
    expect(Object.isFrozen(txFailure)).toBe(true);
    expect(Object.isFrozen(validation)).toBe(true);
    expect(Object.isFrozen(notFound.details)).toBe(true);
    expect(Object.isFrozen(validation.issues)).toBe(true);
  });

  it("registers persistence registries in composition root", () => {
    const root = createCompositionRoot();
    const persistence = root.resolve("PersistenceContractRegistry");
    const repositories = root.resolve("RepositoryRegistry");
    const storage = root.resolve("StorageContractRegistry");

    expect(persistence).toBeDefined();
    expect(repositories).toBe(persistence.getRepositoryRegistry());
    expect(storage).toBe(persistence.getStorageContractRegistry());
    expect(root.getPersistenceContractRegistry()).toBe(persistence);
    expect(root.getRepositoryRegistry()).toBe(repositories);
    expect(root.getStorageContractRegistry()).toBe(storage);
    expect(persistence.validate().valid).toBe(true);
  });

  it("composition root repositories match application API defaults", () => {
    const root = createCompositionRoot();
    const fromRoot = root.getPersistenceContractRegistry().getContracts();
    const fromApi = getPersistenceContracts({
      registry: createPersistenceContractRegistry({
        clock: () => fromRoot.generatedAt,
      }),
    });

    expect(fromRoot.repositories.map((r) => r.token)).toEqual(
      fromApi.repositories.map((r) => r.token),
    );
    expect(fromRoot.storagePorts.map((p) => p.token)).toEqual(
      fromApi.storagePorts.map((p) => p.token),
    );
  });
});

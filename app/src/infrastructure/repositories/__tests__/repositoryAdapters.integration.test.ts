import {
  createCompositionRoot,
  resetCompositionRoot,
} from "../../../core/composition/createCompositionRoot";
import type { PersistenceRecord } from "../../../core/persistence/contracts/PersistenceRecord";
import { SQLiteAdapterFactory } from "../../sqlite/application";
import {
  AthleteRepositoryAdapter,
  IdentityRepositoryAdapter,
  WorkspaceRepositoryAdapter,
  SnapshotRepositoryAdapter,
  TimelineRepositoryAdapter,
  WorkoutRepositoryAdapter,
  NutritionRepositoryAdapter,
  RecoveryRepositoryAdapter,
  SettingsRepositoryAdapter,
  RuntimeRepositoryAdapter,
  createRepositoryAdapters,
} from "../adapters";
import {
  RepositoryAdapterFactory,
  getRepositoryAdapter,
  getRepositoryAdapters,
  validateRepositoryAdapters,
} from "../application";
import {
  REPOSITORY_ADAPTER_TOKENS,
  RepositoryAdapterRegistry,
  createRepositoryAdapterRegistration,
  createRepositoryAdapterRegistry,
  RepositoryAdapterRegistrationError,
  RepositoryAdapterValidationError,
} from "../registry";

describe("Repository Adapter integration (Sprint 30.2)", () => {
  afterEach(() => {
    resetCompositionRoot();
  });

  describe("adapters", () => {
    it("creates all Persistence Contract adapters", () => {
      const { adapters } = RepositoryAdapterFactory.create();
      expect(adapters.athlete).toBeInstanceOf(AthleteRepositoryAdapter);
      expect(adapters.identity).toBeInstanceOf(IdentityRepositoryAdapter);
      expect(adapters.workspace).toBeInstanceOf(WorkspaceRepositoryAdapter);
      expect(adapters.snapshot).toBeInstanceOf(SnapshotRepositoryAdapter);
      expect(adapters.timeline).toBeInstanceOf(TimelineRepositoryAdapter);
      expect(adapters.workout).toBeInstanceOf(WorkoutRepositoryAdapter);
      expect(adapters.nutrition).toBeInstanceOf(NutritionRepositoryAdapter);
      expect(adapters.recovery).toBeInstanceOf(RecoveryRepositoryAdapter);
      expect(adapters.settings).toBeInstanceOf(SettingsRepositoryAdapter);
      expect(adapters.runtime).toBeInstanceOf(RuntimeRepositoryAdapter);
    });

    it("exposes Persistence Contract repositoryIds", () => {
      const adapters = getRepositoryAdapters();
      for (const token of REPOSITORY_ADAPTER_TOKENS) {
        expect(adapters[token].repositoryId).toBe(token);
      }
    });
  });

  describe("delegation", () => {
    it("delegates CRUD to the corresponding SQLite repository", () => {
      const { repositories, adapters } = RepositoryAdapterFactory.create();
      const record: PersistenceRecord = Object.freeze({ id: "rec-1" });

      adapters.athlete.save(record);
      expect(repositories.athlete.findById("rec-1")).toEqual({ id: "rec-1" });
      expect(adapters.athlete.findById("rec-1")).toEqual({ id: "rec-1" });
      expect(adapters.athlete.exists("rec-1")).toBe(true);
      expect(adapters.athlete.list()).toEqual([{ id: "rec-1" }]);
      adapters.athlete.delete("rec-1");
      expect(repositories.athlete.findById("rec-1")).toBeNull();
      expect(adapters.athlete.findById("rec-1")).toBeNull();
    });

    it("isolates tables across adapters", () => {
      const { adapters } = RepositoryAdapterFactory.create();
      adapters.athlete.save({ id: "a1" });
      adapters.workout.save({ id: "w1" });
      expect(adapters.athlete.findById("w1")).toBeNull();
      expect(adapters.workout.findById("a1")).toBeNull();
    });

    it("delegates through every adapter", () => {
      const { adapters } = RepositoryAdapterFactory.create();
      const record: PersistenceRecord = Object.freeze({ id: "all-1" });
      for (const token of REPOSITORY_ADAPTER_TOKENS) {
        const adapter = adapters[token];
        adapter.save(record);
        expect(adapter.findById("all-1")?.id).toBe("all-1");
        expect(adapter.exists("all-1")).toBe(true);
        adapter.delete("all-1");
        expect(adapter.exists("all-1")).toBe(false);
      }
    });
  });

  describe("contract compliance", () => {
    it("adapters implement Persistence Contract surfaces", () => {
      const adapters = getRepositoryAdapters();
      for (const token of REPOSITORY_ADAPTER_TOKENS) {
        const adapter = adapters[token];
        expect(adapter.repositoryId).toBe(token);
        expect(typeof adapter.findById).toBe("function");
        expect(typeof adapter.save).toBe("function");
        expect(typeof adapter.delete).toBe("function");
        expect(typeof adapter.list).toBe("function");
        expect(typeof adapter.exists).toBe("function");
      }
    });
  });

  describe("registry", () => {
    it("registers all adapters with metadata", () => {
      const { registry } = RepositoryAdapterFactory.create();
      expect(registry.list()).toHaveLength(REPOSITORY_ADAPTER_TOKENS.length);
      for (const token of REPOSITORY_ADAPTER_TOKENS) {
        expect(registry.has(token)).toBe(true);
        expect(registry.resolve(token)?.repositoryId).toBe(token);
        const registration = registry.resolveRegistration(token);
        expect(registration?.token).toBe(token);
        expect(registration?.repositoryId).toBe(token);
        expect(registration?.metadata.backend).toBe("sqlite");
      }
    });

    it("rejects duplicate registrations", () => {
      const { repositories } = SQLiteAdapterFactory.create();
      const adapters = createRepositoryAdapters(repositories);
      const registry = createRepositoryAdapterRegistry();
      const registration = createRepositoryAdapterRegistration({
        token: "athlete",
        name: "AthleteRepositoryAdapter",
        version: "1.0.0",
        repositoryId: "athlete",
      });
      registry.register(registration, adapters.athlete);
      expect(() =>
        registry.register(registration, adapters.athlete),
      ).toThrow(RepositoryAdapterRegistrationError);
    });

    it("rejects contract compliance failures", () => {
      const { repositories } = SQLiteAdapterFactory.create();
      const adapters = createRepositoryAdapters(repositories);
      const registry = new RepositoryAdapterRegistry();
      expect(() =>
        registry.register(
          createRepositoryAdapterRegistration({
            token: "athlete",
            name: "AthleteRepositoryAdapter",
            version: "1.0.0",
            repositoryId: "identity",
          }),
          adapters.athlete,
        ),
      ).toThrow(RepositoryAdapterValidationError);
    });
  });

  describe("composition root", () => {
    it("registers RepositoryAdapterRegistry and RepositoryAdapters", () => {
      const root = createCompositionRoot();
      const registry = root.getRepositoryAdapterRegistry();
      const adapters = root.getRepositoryAdapters();

      expect(registry.validate().valid).toBe(true);
      expect(adapters.athlete.repositoryId).toBe("athlete");
      expect(registry.resolve("athlete")).toBe(adapters.athlete);
      expect(root.registry.getRepositoryAdapters()).toBe(adapters);
    });
  });

  describe("application APIs", () => {
    it("exposes getRepositoryAdapters / getRepositoryAdapter", () => {
      const adapters = getRepositoryAdapters();
      const athlete = getRepositoryAdapter("athlete", { adapters });
      expect(athlete.repositoryId).toBe("athlete");
      expect(getRepositoryAdapter("settings").repositoryId).toBe("settings");
    });

    it("validates missing registry and adapters", () => {
      const validation = validateRepositoryAdapters({
        registry: null,
        adapters: null,
      });
      expect(validation.valid).toBe(false);
      expect(validation.errors).toEqual(
        expect.arrayContaining([
          "Missing adapter registration",
          "Missing repository adapters",
        ]),
      );
    });

    it("validates a healthy bundle", () => {
      const validation = validateRepositoryAdapters();
      expect(validation.valid).toBe(true);
      expect(validation.errors).toEqual([]);
    });
  });

  describe("validation", () => {
    it("reports missing repositories", () => {
      const registry = createRepositoryAdapterRegistry();
      const validation = validateRepositoryAdapters({
        registry,
        adapters: null,
      });
      expect(validation.valid).toBe(false);
      expect(validation.errors).toEqual(
        expect.arrayContaining([
          "Missing repository: athlete",
          "Missing repository adapters",
        ]),
      );
    });
  });

  describe("immutability", () => {
    it("freezes adapters bag and registrations", () => {
      const { adapters, registry } = RepositoryAdapterFactory.create();
      expect(Object.isFrozen(adapters)).toBe(true);
      const registration = registry.resolveRegistration("athlete");
      expect(registration).toBeDefined();
      expect(Object.isFrozen(registration)).toBe(true);
      expect(Object.isFrozen(registration!.metadata)).toBe(true);
    });

    it("freezes validation results", () => {
      const validation = validateRepositoryAdapters();
      expect(Object.isFrozen(validation)).toBe(true);
      expect(Object.isFrozen(validation.errors)).toBe(true);
    });
  });
});

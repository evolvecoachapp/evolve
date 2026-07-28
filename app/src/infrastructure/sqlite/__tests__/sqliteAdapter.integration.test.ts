import {
  createCompositionRoot,
  resetCompositionRoot,
} from "../../../core/composition/createCompositionRoot";
import {
  AthleteMapper,
  IdentityMapper,
  WorkspaceMapper,
  SnapshotMapper,
  TimelineMapper,
  WorkoutMapper,
  NutritionMapper,
  RecoveryMapper,
  SettingsMapper,
  RuntimeMapper,
  mapRecordToRow,
  mapRowToRecord,
} from "../mappers";
import { createSQLiteRow } from "../mappers/SQLiteRow";
import {
  SQLiteAdapterFactory,
  getSQLiteConnection,
  getSQLiteHealth,
  getSQLiteRepositories,
  validateSQLite,
} from "../application";
import { SQLiteConnection } from "../connection/SQLiteConnection";
import { SQLiteAdapter } from "../application/SQLiteAdapter";
import { begin, commit, rollback } from "../transactions";
import { ValidationError } from "../../../core/persistence/errors";
import type { PersistenceRecord } from "../../../core/persistence/contracts/PersistenceRecord";

describe("SQLite Infrastructure Adapter integration (Sprint 30.1)", () => {
  afterEach(() => {
    resetCompositionRoot();
  });

  describe("connection", () => {
    it("opens an in-memory SQLite connection", () => {
      const connection = new SQLiteConnection({ name: "test-db" });
      expect(connection.isConnected()).toBe(true);
      expect(connection.name).toBe("test-db");
      connection.close();
      expect(connection.isConnected()).toBe(false);
    });

    it("supports KV read/write via storage ports", () => {
      const connection = new SQLiteConnection();
      expect(connection.write("k1", "v1").success).toBe(true);
      expect(connection.read("k1").value).toBe("v1");
      expect(connection.has("k1").value).toBe(true);
      expect(connection.remove("k1").success).toBe(true);
      expect(connection.read("k1").value).toBeNull();
    });

    it("fails operations when connection is closed", () => {
      const connection = new SQLiteConnection();
      connection.close();
      const result = connection.write("k", "v");
      expect(result.success).toBe(false);
      expect(result.errorCode).toBe("storage_unavailable");
    });
  });

  describe("repositories", () => {
    it("persists PersistenceRecords for every repository contract", () => {
      const { repositories } = SQLiteAdapterFactory.create();
      const record: PersistenceRecord = Object.freeze({ id: "rec-1" });

      repositories.athlete.save(record);
      expect(repositories.athlete.findById("rec-1")).toEqual({ id: "rec-1" });
      expect(repositories.athlete.exists("rec-1")).toBe(true);
      expect(repositories.athlete.list()).toEqual([{ id: "rec-1" }]);
      repositories.athlete.delete("rec-1");
      expect(repositories.athlete.findById("rec-1")).toBeNull();

      for (const repo of [
        repositories.identity,
        repositories.workspace,
        repositories.snapshot,
        repositories.timeline,
        repositories.workout,
        repositories.nutrition,
        repositories.recovery,
        repositories.settings,
        repositories.runtime,
      ]) {
        repo.save(record);
        expect(repo.findById("rec-1")?.id).toBe("rec-1");
        expect(repo.repositoryId).toBeTruthy();
      }
    });

    it("isolates tables across repositories", () => {
      const { repositories } = SQLiteAdapterFactory.create();
      repositories.athlete.save({ id: "a1" });
      repositories.workout.save({ id: "w1" });
      expect(repositories.athlete.findById("w1")).toBeNull();
      expect(repositories.workout.findById("a1")).toBeNull();
    });
  });

  describe("transactions", () => {
    it("commits repository writes", () => {
      const { connection, repositories } = SQLiteAdapterFactory.create();
      const started = begin(connection);
      expect(started.success).toBe(true);
      repositories.athlete.save({ id: "t1" });
      expect(commit(connection, started.value!).success).toBe(true);
      expect(repositories.athlete.exists("t1")).toBe(true);
    });

    it("rolls back repository writes", () => {
      const { connection, repositories } = SQLiteAdapterFactory.create();
      const started = begin(connection);
      repositories.athlete.save({ id: "t2" });
      expect(rollback(connection, started.value!).success).toBe(true);
      expect(repositories.athlete.exists("t2")).toBe(false);
    });

    it("rejects invalid transaction sessions", () => {
      const { connection } = SQLiteAdapterFactory.create();
      const result = commit(connection, {
        sessionId: "missing",
        startedAt: new Date().toISOString(),
        status: "open",
        backendId: "sqlite",
      });
      expect(result.success).toBe(false);
      expect(result.errorCode).toBe("transaction_failure");
    });
  });

  describe("mapping", () => {
    it("maps PersistenceRecord to SQLiteRow and back", () => {
      const row = mapRecordToRow({ id: "m1" });
      expect(row).toEqual({ id: "m1", payload: "{}" });
      expect(mapRowToRecord(row)).toEqual({ id: "m1" });
    });

    it("rejects invalid mappings", () => {
      expect(() => mapRecordToRow({ id: "" })).toThrow(ValidationError);
      expect(() =>
        mapRowToRecord(createSQLiteRow({ id: " ", payload: "{}" })),
      ).toThrow(ValidationError);
    });

    it("exposes named pure mappers", () => {
      const mappers = [
        AthleteMapper,
        IdentityMapper,
        WorkspaceMapper,
        SnapshotMapper,
        TimelineMapper,
        WorkoutMapper,
        NutritionMapper,
        RecoveryMapper,
        SettingsMapper,
        RuntimeMapper,
      ];
      for (const mapper of mappers) {
        const row = mapper.toRow({ id: "x" });
        expect(mapper.toRecord(row).id).toBe("x");
      }
    });
  });

  describe("contract compliance", () => {
    it("implements StorageAdapter contract", () => {
      const adapter = new SQLiteAdapter(new SQLiteConnection());
      expect(adapter.adapterId).toBe("storage");
      expect(adapter.write("a", "b").success).toBe(true);
      expect(adapter.read("a").value).toBe("b");
      expect(adapter.exists("a").value).toBe(true);
      expect(adapter.delete("a").success).toBe(true);
      expect(adapter.exists("a").value).toBe(false);
    });

    it("repositories expose Persistence Contract repositoryIds", () => {
      const repos = getSQLiteRepositories();
      expect(repos.athlete.repositoryId).toBe("athlete");
      expect(repos.identity.repositoryId).toBe("identity");
      expect(repos.workspace.repositoryId).toBe("workspace");
      expect(repos.snapshot.repositoryId).toBe("snapshot");
      expect(repos.timeline.repositoryId).toBe("timeline");
      expect(repos.workout.repositoryId).toBe("workout");
      expect(repos.nutrition.repositoryId).toBe("nutrition");
      expect(repos.recovery.repositoryId).toBe("recovery");
      expect(repos.settings.repositoryId).toBe("settings");
      expect(repos.runtime.repositoryId).toBe("runtime");
    });
  });

  describe("health", () => {
    it("reports connection health", () => {
      const health = getSQLiteHealth();
      expect(health.isConnected).toBe(true);
      expect(health.databaseVersion).toBe("1");
      expect(health.adapterVersion).toBe("1.0.0");
      expect(typeof health.storageUsage).toBe("number");
    });

    it("exposes health probes on connection", () => {
      const connection = getSQLiteConnection();
      expect(connection.health.isConnected()).toBe(true);
      expect(connection.health.databaseVersion()).toBe("1");
      expect(connection.health.adapterVersion()).toBe("1.0.0");
      expect(connection.health.storageUsage()).toBeGreaterThanOrEqual(0);
    });
  });

  describe("composition root", () => {
    it("registers SQLite connection, adapter, and repositories", () => {
      const root = createCompositionRoot();
      const connection = root.getSQLiteConnection();
      const adapter = root.getSQLiteAdapter();
      const repositories = root.getSQLiteRepositories();

      expect(connection.isConnected()).toBe(true);
      expect(adapter.connection).toBe(connection);
      expect(repositories.athlete.repositoryId).toBe("athlete");
      expect(root.registry.getSQLiteAdapter()).toBe(adapter);
    });
  });

  describe("application APIs", () => {
    it("exposes getSQLiteHealth / getSQLiteRepositories / getSQLiteConnection", () => {
      const connection = getSQLiteConnection();
      const repositories = getSQLiteRepositories({ connection });
      const health = getSQLiteHealth({ connection });

      expect(connection.isConnected()).toBe(true);
      expect(repositories.settings.repositoryId).toBe("settings");
      expect(health.isConnected).toBe(true);
    });

    it("validates missing connection and adapter", () => {
      const validation = validateSQLite({
        connection: null as unknown as SQLiteConnection,
        adapter: null as unknown as SQLiteAdapter,
        repositories: null as unknown as ReturnType<
          typeof getSQLiteRepositories
        >,
      });
      expect(validation.valid).toBe(false);
      expect(validation.errors).toEqual(
        expect.arrayContaining([
          "Missing connection",
          "Missing SQLiteAdapter",
          "Missing repository registration",
        ]),
      );
    });

    it("validates a healthy bundle", () => {
      const validation = validateSQLite();
      expect(validation.valid).toBe(true);
      expect(validation.errors).toEqual([]);
    });
  });
});

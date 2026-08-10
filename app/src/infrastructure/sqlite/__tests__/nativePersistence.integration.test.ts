import { SQLiteConnection } from "../connection/SQLiteConnection";
import { SQLiteAdapterFactory } from "../application";
import { resetNativeSQLiteTestState } from "../testSupport/resetNativeSQLiteTestState";
import {
  createCompositionRoot,
  resetCompositionRoot,
} from "../../../core/composition/createCompositionRoot";

const TEST_DB_NAME = "evolve-native-persistence-test";

describe("Native SQLite persistence integration (Sprint 34.2)", () => {
  afterEach(() => {
    resetCompositionRoot();
    resetNativeSQLiteTestState();
  });

  describe("first launch database creation", () => {
    it("opens a persistent database and initializes schema on first launch", () => {
      const connection = new SQLiteConnection({ name: TEST_DB_NAME });
      expect(connection.isConnected()).toBe(true);

      const health = connection.health.report();
      expect(health.isConnected).toBe(true);
      expect(health.databaseVersion).toBe("1");
      expect(health.adapterVersion).toBe("1.0.0");

      const { repositories } = SQLiteAdapterFactory.create({ connection });
      repositories.identity.save(Object.freeze({ id: "first-launch" }));
      expect(repositories.identity.findById("first-launch")).toEqual({
        id: "first-launch",
      });

      connection.close();
      expect(connection.isConnected()).toBe(false);
    });
  });

  describe("reopen existing database", () => {
    it("reopens the same database file and finds existing records", () => {
      const first = new SQLiteConnection({ name: TEST_DB_NAME });
      const firstRepos = SQLiteAdapterFactory.create({ connection: first }).repositories;
      firstRepos.workspace.save(Object.freeze({ id: "ws-reopen" }));
      first.close();

      const second = new SQLiteConnection({ name: TEST_DB_NAME });
      const secondRepos = SQLiteAdapterFactory.create({ connection: second }).repositories;
      expect(secondRepos.workspace.findById("ws-reopen")).toEqual({
        id: "ws-reopen",
      });
      second.close();
    });
  });

  describe("persistence across app restart", () => {
    it("survives composition root reset when the database file name is unchanged", () => {
      const rootA = createCompositionRoot({
        configuration: { preferSingletons: true },
      });
      const adaptersA = rootA.resolve("RepositoryAdapters");
      adaptersA.runtime.save(Object.freeze({ id: "runtime:restart" }));
      expect(adaptersA.runtime.findById("runtime:restart")).toEqual({
        id: "runtime:restart",
      });

      resetCompositionRoot();

      const rootB = createCompositionRoot({
        configuration: { preferSingletons: true },
      });
      const adaptersB = rootB.resolve("RepositoryAdapters");
      expect(adaptersB.runtime.findById("runtime:restart")).toEqual({
        id: "runtime:restart",
      });
    });
  });

  describe("repository compatibility", () => {
    it("preserves CRUD semantics for every repository contract table", () => {
      const { repositories } = SQLiteAdapterFactory.create({
        connection: new SQLiteConnection({ name: TEST_DB_NAME }),
      });
      const record = Object.freeze({ id: "compat-1" });

      for (const repo of [
        repositories.athlete,
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
        expect(repo.findById("compat-1")).toEqual(record);
        expect(repo.exists("compat-1")).toBe(true);
        expect(repo.list()).toEqual([record]);
      }
    });
  });

  describe("composition compatibility", () => {
    it("registers native SQLite through the Composition Root unchanged", () => {
      const root = createCompositionRoot();
      const connection = root.getSQLiteConnection();
      const adapter = root.getSQLiteAdapter();
      const repositories = root.getSQLiteRepositories();

      expect(connection.isConnected()).toBe(true);
      expect(adapter.connection).toBe(connection);
      expect(repositories.identity.repositoryId).toBe("identity");
      expect(root.registry.getSQLiteAdapter()).toBe(adapter);
    });
  });
});

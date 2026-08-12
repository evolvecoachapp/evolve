import {
  IdentityRepositoryAdapter,
  RuntimeRepositoryAdapter,
  WorkspaceRepositoryAdapter,
} from "../../../infrastructure/repositories/adapters";
import {
  createCompositionRoot,
  getCompositionRoot,
  resetCompositionRoot,
} from "../createCompositionRoot";
import { resetNativeSQLiteTestState } from "../../../infrastructure/sqlite/testSupport/resetNativeSQLiteTestState";
import {
  composeTestWorkspaceForAthlete,
  FIXED_DASHBOARD_ATHLETE_ID,
} from "../../../integrations/dashboard-projection/testSupport/fixtures";
import { resetRuntimeBootstrap } from "../../../runtime/bootstrap/RuntimeBootstrap";
import { resetRepositoryHydration } from "../../../runtime/hydration/RepositoryHydrationPipeline";
import { hydrateRuntime } from "../../../runtime/hydration/application/hydrateRuntime";
import { resetDashboardRestore } from "../../../runtime/dashboard-restore/DashboardRestorePipeline";
import { resetRuntimeWriteThrough } from "../../../runtime/write-through/RuntimeWriteThroughPipeline";
import { getRuntimeWriteThroughPromise } from "../../../runtime/write-through/RuntimeWriteThroughPipeline";
import { persistRuntime } from "../../../runtime/write-through/application/persistRuntime";
import { getWriteThroughStatus } from "../../../runtime/write-through/application/getWriteThroughStatus";
import { RUNTIME_WRITE_THROUGH_STATUS } from "../../../runtime/write-through/RuntimeWriteThroughStatus";
import { resetRuntimeSession } from "../../../runtime/session/RuntimeSessionOrchestrator";
import { startRuntimeSession } from "../../../runtime/session/application/startRuntimeSession";
import { resetRuntimeObserver } from "../../../runtime/runtime-observer/RuntimeObserver";
import { observeRuntime } from "../../../runtime/runtime-observer/application/observeRuntime";
import { readRecordPayload } from "../../../runtime/persistence/DomainRecord";
import type { AthleteIdentity } from "../../../features/athlete-identity/models/AthleteIdentity";
import type { RuntimeEnvironment } from "../../../features/runtime-environment/models/RuntimeEnvironment";
import type { Workspace } from "../../../features/unified-workspace/models/Workspace";
import { createPayloadRecord } from "../../../runtime/write-through/testSupport/mockRepositories";

const ATHLETE_ID = FIXED_DASHBOARD_ATHLETE_ID;
const FIXED_CLOCK = () => "2026-08-10T10:00:00.000Z";

function resetRuntimePipelinesPreservingCompositionRoot(): void {
  resetRuntimeObserver();
  resetRuntimeSession();
  resetRepositoryHydration();
  resetDashboardRestore();
  resetRuntimeWriteThrough();
}

function resetAllRuntimeState(): void {
  resetRuntimePipelinesPreservingCompositionRoot();
  resetRuntimeBootstrap();
  resetCompositionRoot();
  resetNativeSQLiteTestState();
}

async function flushMicrotasks(count = 5): Promise<void> {
  for (let index = 0; index < count; index += 1) {
    await Promise.resolve();
  }
}

async function waitForWriteThrough(): Promise<void> {
  for (let index = 0; index < 50; index += 1) {
    const inFlight = getRuntimeWriteThroughPromise();
    if (inFlight) {
      await inFlight.catch(() => undefined);
    }
    if (getWriteThroughStatus() === RUNTIME_WRITE_THROUGH_STATUS.ready) {
      return;
    }
    await Promise.resolve();
  }
  throw new Error("Write-through did not reach ready state");
}

async function buildRuntimeStateForPersistence(
  athleteId: string = ATHLETE_ID,
): Promise<void> {
  const root = getCompositionRoot();
  root.resolve("AthleteIdentityService").build({
    athleteId,
    requestId: `sqlite:identity:${athleteId}`,
    profile: {
      displayName: "Alex Rivera",
      givenName: "Alex",
      familyName: "Rivera",
      sex: "unspecified",
      birthYear: 1990,
      experienceLevel: "intermediate",
    },
    locale: { languageTag: "en-US" },
    units: { system: "metric" },
    timeZone: { iana: "Etc/UTC", displayName: "UTC" },
  });
  await flushMicrotasks();

  root.resolve("RuntimeEnvironmentService").build({
    requestId: "sqlite:runtime:1",
    device: {
      deviceId: "sqlite:device:1",
      model: "Test Device",
      manufacturer: "EVOLVE",
      osVersion: "0.0.0",
      formFactor: "phone",
    },
    platform: { kind: "ios", version: "0.0.0" },
    application: {
      appId: "com.evolve.app",
      name: "EVOLVE",
      version: "0.6.0",
      buildNumber: "0",
      channel: "test",
    },
    locale: { languageTag: "en-US" },
  });
  await flushMicrotasks();

  root.resolve("UnifiedWorkspaceService").build({
    athleteId,
    requestId: `sqlite:workspace:${athleteId}`,
  });
  composeTestWorkspaceForAthlete(
    root.resolve("UnifiedWorkspaceService"),
    athleteId,
  );
  await flushMicrotasks();
}

describe("SQLite runtime persistence activation (Sprint 34.1 / 34.3)", () => {
  afterEach(() => {
    resetAllRuntimeState();
  });

  describe("composition wiring", () => {
    it("locks runtime persistence to sqlite and training repos to in-memory", () => {
      const root = createCompositionRoot();
      expect(root.configuration.repositoryMode).toBe("in-memory");
      expect(root.configuration.runtimePersistenceMode).toBe("sqlite");
    });

    it("registers SQLite-backed repository adapters through PersistenceRepositoryProvider", () => {
      const root = createCompositionRoot();
      const adapters = root.resolve("RepositoryAdapters");

      expect(adapters.identity).toBeInstanceOf(IdentityRepositoryAdapter);
      expect(adapters.runtime).toBeInstanceOf(RuntimeRepositoryAdapter);
      expect(adapters.workspace).toBeInstanceOf(WorkspaceRepositoryAdapter);

      const registry = root.resolve("RepositoryAdapterRegistry");
      expect(registry.resolveRegistration("identity")?.metadata.backend).toBe(
        "sqlite",
      );
      expect(registry.resolveRegistration("runtime")?.metadata.backend).toBe(
        "sqlite",
      );
      expect(registry.resolveRegistration("workspace")?.metadata.backend).toBe(
        "sqlite",
      );
    });

    it("shares one SQLite connection across adapter registrations", () => {
      const root = createCompositionRoot();
      const connectionA = root.resolve("SQLiteConnection");
      const connectionB = root.resolve("SQLiteConnection");
      expect(connectionA).toBe(connectionB);
      expect(connectionA.isConnected()).toBe(true);
    });
  });

  describe("startup from empty database", () => {
    it("hydrates with zero records when SQLite tables are empty", async () => {
      await startRuntimeSession({
        athleteIds: [ATHLETE_ID],
        clock: FIXED_CLOCK,
      });

      const result = await hydrateRuntime();
      expect(result.identityRecordCount).toBe(0);
      expect(result.runtimeRecordCount).toBe(0);
      expect(result.workspaceRecordCount).toBe(0);
    });
  });

  describe("startup from populated database", () => {
    it("hydrates identity, runtime, and workspace records from SQLite", async () => {
      await startRuntimeSession({
        athleteIds: [ATHLETE_ID],
        clock: FIXED_CLOCK,
      });

      await buildRuntimeStateForPersistence();

      const root = getCompositionRoot();
      const identity = root
        .resolve("AthleteIdentityService")
        .getAthleteIdentity(ATHLETE_ID);
      const runtime = root
        .resolve("RuntimeEnvironmentService")
        .getRuntimeEnvironment();
      const workspace = root
        .resolve("UnifiedWorkspaceService")
        .getWorkspace(ATHLETE_ID);

      const adapters = root.resolve("RepositoryAdapters");
      if (identity) {
        adapters.identity.save(createPayloadRecord(identity.athleteId, identity));
      }
      if (runtime) {
        adapters.runtime.save(createPayloadRecord(runtime.id, runtime));
      }
      if (workspace) {
        adapters.workspace.save(createPayloadRecord(workspace.athleteId, workspace));
      }

      resetRuntimePipelinesPreservingCompositionRoot();

      const restarted = await startRuntimeSession({
        athleteIds: [ATHLETE_ID],
        clock: FIXED_CLOCK,
      });

      expect(restarted.hydration.identityRecordCount).toBe(1);
      expect(restarted.hydration.runtimeRecordCount).toBe(1);
      expect(restarted.hydration.workspaceRecordCount).toBe(1);
    });
  });

  describe("write-through persistence", () => {
    it("persists runtime service state into SQLite repository adapters", async () => {
      await startRuntimeSession({
        athleteIds: [ATHLETE_ID],
        clock: FIXED_CLOCK,
      });
      observeRuntime({ athleteIds: [ATHLETE_ID], clock: FIXED_CLOCK });

      const root = getCompositionRoot();
      const adapters = root.resolve("RepositoryAdapters");
      expect(adapters.identity.list().length).toBeGreaterThanOrEqual(1);
      expect(adapters.workspace.list().length).toBeGreaterThanOrEqual(1);
      expect(adapters.runtime.list()).toHaveLength(0);

      await buildRuntimeStateForPersistence();
      await waitForWriteThrough();

      expect(adapters.identity.list().length).toBeGreaterThanOrEqual(1);
      expect(adapters.runtime.list().length).toBeGreaterThanOrEqual(1);
      expect(adapters.workspace.list().length).toBeGreaterThanOrEqual(1);
    });

    it("writes through repository contracts without direct SQLite imports in runtime", async () => {
      await startRuntimeSession({
        athleteIds: [ATHLETE_ID],
        clock: FIXED_CLOCK,
      });

      const root = getCompositionRoot();
      root.resolve("UnifiedWorkspaceService").build({
        athleteId: ATHLETE_ID,
        requestId: "sqlite:workspace:1",
      });
      composeTestWorkspaceForAthlete(
        root.resolve("UnifiedWorkspaceService"),
        ATHLETE_ID,
      );

      await persistRuntime({ athleteIds: [ATHLETE_ID] });

      const adapters = root.resolve("RepositoryAdapters");
      expect(adapters.workspace.list().length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("restart persistence", () => {
    it("round-trips persisted domain payloads through re-hydration after pipeline restart", async () => {
      await startRuntimeSession({
        athleteIds: [ATHLETE_ID],
        clock: FIXED_CLOCK,
      });
      observeRuntime({ athleteIds: [ATHLETE_ID], clock: FIXED_CLOCK });

      await buildRuntimeStateForPersistence();
      await waitForWriteThrough();

      const root = getCompositionRoot();
      const adapters = root.resolve("RepositoryAdapters");
      const savedIdentity = readRecordPayload<AthleteIdentity>(
        adapters.identity.list()[0],
      );
      const savedRuntime = readRecordPayload<RuntimeEnvironment>(
        adapters.runtime.list()[0],
      );
      const savedWorkspace = readRecordPayload<Workspace>(
        adapters.workspace.list()[0],
      );

      expect(savedIdentity?.profile.displayName).toBe("Alex Rivera");
      expect(savedRuntime?.device.model).toBe("Test Device");
      expect(savedWorkspace?.athleteId).toBe(ATHLETE_ID);

      resetRuntimePipelinesPreservingCompositionRoot();

      await startRuntimeSession({
        athleteIds: [ATHLETE_ID],
        clock: FIXED_CLOCK,
      });

      expect(
        root.resolve("AthleteIdentityService").getAthleteIdentity(ATHLETE_ID)
          ?.profile.displayName,
      ).toBe("Alex Rivera");
      expect(
        root.resolve("RuntimeEnvironmentService").getRuntimeEnvironment()
          ?.device.model,
      ).toBe("Test Device");
      expect(
        root.resolve("UnifiedWorkspaceService").getWorkspace(ATHLETE_ID)
          ?.athleteId,
      ).toBe(ATHLETE_ID);
    });
  });

  describe("repository integration", () => {
    it("delegates CRUD from repository adapters to SQLite repositories", () => {
      const root = createCompositionRoot();
      const adapters = root.resolve("RepositoryAdapters");
      const sqliteRepos = root.resolve("SQLiteRepositories");

      const record = Object.freeze({ id: ATHLETE_ID });
      adapters.identity.save(record);

      expect(sqliteRepos.identity.findById(ATHLETE_ID)).toEqual(record);
      expect(adapters.identity.findById(ATHLETE_ID)).toEqual(record);
      expect(adapters.identity.exists(ATHLETE_ID)).toBe(true);
      expect(adapters.identity.list()).toEqual([record]);
    });

    it("persists serialized domain payloads through SQLite adapters", async () => {
      await startRuntimeSession({
        athleteIds: [ATHLETE_ID],
        clock: FIXED_CLOCK,
      });

      await buildRuntimeStateForPersistence();
      resetRuntimeWriteThrough();
      await persistRuntime({ athleteIds: [ATHLETE_ID] });

      const adapters = getCompositionRoot().resolve("RepositoryAdapters");
      const identityRecord = adapters.identity.list()[0];
      const runtimeRecord = adapters.runtime.list()[0];
      const workspaceRecord = adapters.workspace.list()[0];

      expect(
        readRecordPayload<AthleteIdentity>(identityRecord)?.profile.givenName,
      ).toBe("Alex");
      expect(
        readRecordPayload<RuntimeEnvironment>(runtimeRecord)?.application.name,
      ).toBe("EVOLVE");
      expect(readRecordPayload<Workspace>(workspaceRecord)?.athleteId).toBe(
        ATHLETE_ID,
      );
    });
  });
});

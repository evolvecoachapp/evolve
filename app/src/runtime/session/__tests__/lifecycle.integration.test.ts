import { resetCompositionRoot, getCompositionRoot } from "../../../core/composition/createCompositionRoot";
import {
  composeTestWorkspaceForAthlete,
  FIXED_DASHBOARD_ATHLETE_ID,
} from "../../../integrations/dashboard-projection/testSupport/fixtures";
import { resetRuntimeBootstrap } from "../../bootstrap/RuntimeBootstrap";
import { getBootstrapStatus } from "../../bootstrap/application/getBootstrapStatus";
import { BOOTSTRAP_STATUS } from "../../bootstrap/BootstrapStatus";
import { resetDashboardRestore } from "../../dashboard-restore/DashboardRestorePipeline";
import { restoreDashboard } from "../../dashboard-restore/application/restoreDashboard";
import { getDashboardRestoreStatus } from "../../dashboard-restore/application/getDashboardRestoreStatus";
import { DASHBOARD_RESTORE_STATUS } from "../../dashboard-restore/DashboardRestoreStatus";
import { resetRepositoryHydration } from "../../hydration/RepositoryHydrationPipeline";
import { getHydrationStatus } from "../../hydration/application/getHydrationStatus";
import { HYDRATION_STATUS } from "../../hydration/HydrationStatus";
import { observeRuntime, getRuntimeObserverStatus } from "../../runtime-observer/application";
import { RUNTIME_OBSERVER_STATUS } from "../../runtime-observer/RuntimeObserverStatus";
import { resetRuntimeObserver } from "../../runtime-observer/RuntimeObserver";
import {
  getRuntimeWriteThroughPromise,
  resetRuntimeWriteThrough,
} from "../../write-through/RuntimeWriteThroughPipeline";
import { getWriteThroughStatus } from "../../write-through/application/getWriteThroughStatus";
import { RUNTIME_WRITE_THROUGH_STATUS } from "../../write-through/RuntimeWriteThroughStatus";
import { RUNTIME_SESSION_PHASES } from "../RuntimeSessionInitialization";
import { resetRuntimeSession } from "../RuntimeSessionOrchestrator";
import {
  getRuntimeSessionStatus,
  startRuntimeSession,
} from "../application";
import { RUNTIME_SESSION_STATUS } from "../RuntimeSessionStatus";
import * as bootstrapApplication from "../../bootstrap/application/bootstrapRuntime";
import * as hydrationApplication from "../../hydration/application/hydrateRuntime";
import * as restoreApplication from "../../dashboard-restore/application/restoreDashboard";
import { createPayloadRecord } from "../../write-through/testSupport/mockRepositories";
import { HydrationError } from "../../hydration/HydrationError";
import { DashboardRestoreError } from "../../dashboard-restore/DashboardRestoreError";

const FIXED_CLOCK = () => "2026-08-10T10:00:00.000Z";
const ATHLETE_ID = FIXED_DASHBOARD_ATHLETE_ID;

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
}

async function buildRuntimeStateThroughObserver(
  athleteId: string = ATHLETE_ID,
): Promise<void> {
  const root = getCompositionRoot();
  const athleteIdentityService = root.resolve("AthleteIdentityService");
  const runtimeEnvironmentService = root.resolve("RuntimeEnvironmentService");
  const unifiedWorkspaceService = root.resolve("UnifiedWorkspaceService");

  athleteIdentityService.build({
    athleteId,
    requestId: `lifecycle:identity:${athleteId}`,
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

  runtimeEnvironmentService.build({
    requestId: "lifecycle:runtime:1",
    device: {
      deviceId: "runtime:lifecycle:1",
      model: "Test Device",
      manufacturer: "EVOLVE",
      osVersion: "0.0.0",
      formFactor: "phone",
    },
    platform: {
      kind: "ios",
      version: "0.0.0",
    },
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

  unifiedWorkspaceService.build({
    athleteId,
    requestId: `lifecycle:workspace:${athleteId}`,
  });
  composeTestWorkspaceForAthlete(unifiedWorkspaceService, athleteId);
  await flushMicrotasks();
}

async function flushMicrotasks(count = 5): Promise<void> {
  for (let index = 0; index < count; index += 1) {
    await Promise.resolve();
  }
}

function buildComposedWorkspaceWithoutObserver(athleteId: string = ATHLETE_ID): void {
  const root = getCompositionRoot();
  const athleteIdentityService = root.resolve("AthleteIdentityService");
  const unifiedWorkspaceService = root.resolve("UnifiedWorkspaceService");

  athleteIdentityService.build({
    athleteId,
    requestId: `lifecycle:identity:${athleteId}`,
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

  unifiedWorkspaceService.build({
    athleteId,
    requestId: `lifecycle:workspace:${athleteId}`,
  });
  composeTestWorkspaceForAthlete(unifiedWorkspaceService, athleteId);
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

describe("Runtime lifecycle end-to-end integration", () => {
  afterEach(() => {
    jest.restoreAllMocks();
    resetAllRuntimeState();
  });

  describe("authenticated startup with empty repositories", () => {
    it("completes bootstrap, hydration, and dashboard restore through startRuntimeSession", async () => {
      const result = await startRuntimeSession({
        athleteIds: [ATHLETE_ID],
        clock: FIXED_CLOCK,
      });

      expect(result.status).toBe("ready");
      expect(result.bootstrap.status).toBe("ready");
      expect(result.hydration.status).toBe("ready");
      expect(result.dashboardRestore.status).toBe("ready");
      expect(result.phases).toEqual([...RUNTIME_SESSION_PHASES]);
      expect(getRuntimeSessionStatus()).toBe(RUNTIME_SESSION_STATUS.ready);
      expect(getBootstrapStatus()).toBe(BOOTSTRAP_STATUS.ready);
      expect(getHydrationStatus()).toBe(HYDRATION_STATUS.ready);
      expect(getDashboardRestoreStatus()).toBe(DASHBOARD_RESTORE_STATUS.ready);
    });

    it("reports zero repository records when repositories are empty", async () => {
      const result = await startRuntimeSession({
        athleteIds: [ATHLETE_ID],
        clock: FIXED_CLOCK,
      });

      expect(result.hydration.identityRecordCount).toBe(0);
      expect(result.hydration.runtimeRecordCount).toBe(0);
      expect(result.hydration.workspaceRecordCount).toBe(0);
      expect(result.dashboardRestore.projectedCount).toBe(1);
      expect(result.dashboardRestore.emptyCount).toBe(0);

      const root = getCompositionRoot();
      expect(
        root.resolve("AthleteIdentityService").getAthleteIdentity(ATHLETE_ID),
      ).not.toBeNull();
      expect(
        root.resolve("UnifiedWorkspaceService").getWorkspace(ATHLETE_ID),
      ).not.toBeNull();
    });
  });

  describe("authenticated startup with populated repositories", () => {
    it("hydrates identity, runtime, and workspace records from repository contracts", async () => {
      await startRuntimeSession({
        athleteIds: [ATHLETE_ID],
        clock: FIXED_CLOCK,
      });

      const root = getCompositionRoot();
      root.resolve("AthleteIdentityService").build({
        athleteId: ATHLETE_ID,
        requestId: `lifecycle:identity:${ATHLETE_ID}`,
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
      root.resolve("RuntimeEnvironmentService").build({
        requestId: "lifecycle:runtime:1",
        device: {
          deviceId: "runtime:1",
          model: "Lifecycle Device",
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
      root.resolve("UnifiedWorkspaceService").build({
        athleteId: ATHLETE_ID,
        requestId: `lifecycle:workspace:${ATHLETE_ID}`,
      });
      composeTestWorkspaceForAthlete(
        root.resolve("UnifiedWorkspaceService"),
        ATHLETE_ID,
      );

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

      expect(
        root.resolve("AthleteIdentityService").getAthleteIdentity(ATHLETE_ID),
      ).not.toBeNull();
      expect(
        root.resolve("RuntimeEnvironmentService").getRuntimeEnvironment(),
      ).not.toBeNull();
    });
  });

  describe("dashboard restoration", () => {
    it("returns primaryDashboard through the full session chain", async () => {
      const result = await startRuntimeSession({
        athleteIds: [ATHLETE_ID],
        clock: FIXED_CLOCK,
      });

      expect(result.dashboardRestore.primaryDashboard).toBeDefined();
      expect(result.dashboardRestore.athleteCount).toBe(1);
    });

    it("projects composed workspace when athlete workspace exists", async () => {
      await startRuntimeSession({
        athleteIds: [ATHLETE_ID],
        clock: FIXED_CLOCK,
      });
      buildComposedWorkspaceWithoutObserver();

      resetDashboardRestore();
      const restored = await restoreDashboard({ athleteIds: [ATHLETE_ID] });

      expect(restored.projectedCount).toBeGreaterThanOrEqual(1);
      expect(restored.primaryDashboard.athlete.present).toBe(true);
    });
  });

  describe("automatic runtime persistence", () => {
    it("persists runtime state through observer after session reaches ready", async () => {
      await startRuntimeSession({
        athleteIds: [ATHLETE_ID],
        clock: FIXED_CLOCK,
      });
      observeRuntime({ athleteIds: [ATHLETE_ID], clock: FIXED_CLOCK });

      const adapters = getCompositionRoot().resolve("RepositoryAdapters");
      expect(adapters.identity.list().length).toBeGreaterThanOrEqual(1);
      expect(adapters.workspace.list().length).toBeGreaterThanOrEqual(1);
      expect(adapters.runtime.list()).toHaveLength(0);

      await buildRuntimeStateThroughObserver();
      await waitForWriteThrough();

      expect(getWriteThroughStatus()).toBe(RUNTIME_WRITE_THROUGH_STATUS.ready);
      expect(adapters.identity.list().length).toBeGreaterThanOrEqual(1);
      expect(adapters.runtime.list().length).toBeGreaterThanOrEqual(1);
      expect(adapters.workspace.list().length).toBeGreaterThanOrEqual(1);
    });

    it("round-trips persisted state through re-hydration after restart", async () => {
      await startRuntimeSession({
        athleteIds: [ATHLETE_ID],
        clock: FIXED_CLOCK,
      });
      observeRuntime({ athleteIds: [ATHLETE_ID], clock: FIXED_CLOCK });
      await buildRuntimeStateThroughObserver();
      await waitForWriteThrough();

      const adapters = getCompositionRoot().resolve("RepositoryAdapters");
      const identityCount = adapters.identity.list().length;
      const runtimeCount = adapters.runtime.list().length;
      const workspaceCount = adapters.workspace.list().length;
      expect(identityCount).toBeGreaterThanOrEqual(1);

      resetRuntimePipelinesPreservingCompositionRoot();

      const restarted = await startRuntimeSession({
        athleteIds: [ATHLETE_ID],
        clock: FIXED_CLOCK,
      });

      expect(restarted.hydration.identityRecordCount).toBe(identityCount);
      expect(restarted.hydration.runtimeRecordCount).toBe(runtimeCount);
      expect(restarted.hydration.workspaceRecordCount).toBe(workspaceCount);
    });
  });

  describe("logout reset and restart sequence", () => {
    it("resets all pipeline state and allows deterministic re-start", async () => {
      const first = await startRuntimeSession({
        athleteIds: [ATHLETE_ID],
        clock: FIXED_CLOCK,
      });
      observeRuntime({ athleteIds: [ATHLETE_ID], clock: FIXED_CLOCK });

      expect(getRuntimeObserverStatus()).toBe(RUNTIME_OBSERVER_STATUS.ready);

      resetAllRuntimeState();

      expect(getRuntimeSessionStatus()).toBe(RUNTIME_SESSION_STATUS.idle);
      expect(getRuntimeObserverStatus()).toBe(RUNTIME_OBSERVER_STATUS.idle);

      const second = await startRuntimeSession({
        athleteIds: [ATHLETE_ID],
        clock: FIXED_CLOCK,
      });

      expect(second.status).toBe("ready");
      expect(second.phases).toEqual([...RUNTIME_SESSION_PHASES]);
      expect(first.startedAt).toBeDefined();
      expect(second.startedAt).toBeDefined();
    });
  });

  describe("deterministic execution order", () => {
    it("records session phases in fixed order", async () => {
      const result = await startRuntimeSession({
        athleteIds: [ATHLETE_ID],
        clock: FIXED_CLOCK,
      });

      expect(result.phases).toEqual([
        "bootstrap_completed",
        "hydration_completed",
        "dashboard_restore_completed",
        "session_frozen",
      ]);
    });

    it("executes session pipelines before observer activation", async () => {
      await startRuntimeSession({
        athleteIds: [ATHLETE_ID],
        clock: FIXED_CLOCK,
      });

      expect(getRuntimeSessionStatus()).toBe(RUNTIME_SESSION_STATUS.ready);
      expect(getRuntimeObserverStatus()).toBe(RUNTIME_OBSERVER_STATUS.idle);

      observeRuntime({ athleteIds: [ATHLETE_ID], clock: FIXED_CLOCK });
      expect(getRuntimeObserverStatus()).toBe(RUNTIME_OBSERVER_STATUS.ready);
    });
  });

  describe("failure propagation", () => {
    it("stops at hydration failure without dashboard restore", async () => {
      jest
        .spyOn(hydrationApplication, "hydrateRuntime")
        .mockRejectedValue(
          new HydrationError("Repository contract rejected hydration", "repository_contract_failed"),
        );

      const restoreSpy = jest.spyOn(restoreApplication, "restoreDashboard");

      await expect(
        startRuntimeSession({
          athleteIds: [ATHLETE_ID],
          clock: FIXED_CLOCK,
        }),
      ).rejects.toMatchObject({ code: "hydration_failed" });

      expect(restoreSpy).not.toHaveBeenCalled();
      expect(getRuntimeSessionStatus()).toBe(RUNTIME_SESSION_STATUS.failed);
      expect(getRuntimeObserverStatus()).toBe(RUNTIME_OBSERVER_STATUS.idle);
    });

    it("stops at dashboard restore failure without starting observer", async () => {
      jest
        .spyOn(restoreApplication, "restoreDashboard")
        .mockRejectedValue(
          new DashboardRestoreError("Dashboard projection failed", "projection_failed"),
        );

      await expect(
        startRuntimeSession({
          athleteIds: [ATHLETE_ID],
          clock: FIXED_CLOCK,
        }),
      ).rejects.toMatchObject({ code: "restore_failed" });

      expect(getRuntimeSessionStatus()).toBe(RUNTIME_SESSION_STATUS.failed);

      expect(() =>
        observeRuntime({ athleteIds: [ATHLETE_ID], clock: FIXED_CLOCK }),
      ).not.toThrow();
    });

    it("propagates bootstrap failure as session failure", async () => {
      jest.spyOn(bootstrapApplication, "bootstrapRuntime").mockRejectedValue(
        new Error("Composition Root bootstrap failed"),
      );

      await expect(
        startRuntimeSession({
          athleteIds: [ATHLETE_ID],
          clock: FIXED_CLOCK,
        }),
      ).rejects.toMatchObject({ code: "bootstrap_failed" });

      expect(getRuntimeSessionStatus()).toBe(RUNTIME_SESSION_STATUS.failed);
      expect(getHydrationStatus()).not.toBe(HYDRATION_STATUS.ready);
    });
  });
});

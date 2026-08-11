import { resetCompositionRoot, getCompositionRoot } from "../../../core/composition/createCompositionRoot";
import { createAthleteIdentityService } from "../../../features/athlete-identity/services/AthleteIdentityService";
import { createRuntimeEnvironmentService } from "../../../features/runtime-environment/services/RuntimeEnvironmentService";
import {
  composeTestWorkspaceForAthlete,
  createTestUnifiedWorkspaceServiceForDashboard,
  FIXED_DASHBOARD_ATHLETE_ID,
} from "../../../integrations/dashboard-projection/testSupport/fixtures";
import {
  createNutritionRuntimePersistenceService,
  createRecoveryRuntimePersistenceService,
  createWorkoutRuntimePersistenceService,
} from "../../domain-persistence/services";
import { RuntimeBootstrap, resetRuntimeBootstrap } from "../../bootstrap/RuntimeBootstrap";
import { resetDashboardRestore } from "../../dashboard-restore/DashboardRestorePipeline";
import { resetRepositoryHydration } from "../../hydration/RepositoryHydrationPipeline";
import { resetRuntimeWriteThrough } from "../../write-through/RuntimeWriteThroughPipeline";
import { RUNTIME_OBSERVER_STATUS } from "../RuntimeObserverStatus";
import { RuntimeObserver, resetRuntimeObserver } from "../RuntimeObserver";
import { getRuntimeObserverStatus, observeRuntime } from "../application";
import { getWriteThroughStatus } from "../../write-through/application/getWriteThroughStatus";
import { RUNTIME_WRITE_THROUGH_STATUS } from "../../write-through/RuntimeWriteThroughStatus";
import { getRuntimeWriteThroughPromise } from "../../write-through/RuntimeWriteThroughPipeline";
import { MockLogger } from "../../../infrastructure/logging";

const FIXED_CLOCK = () => "2026-08-11T10:00:00.000Z";
const ATHLETE_ID = FIXED_DASHBOARD_ATHLETE_ID;

function createObservedServices() {
  const athleteIdentityService = createAthleteIdentityService({
    clock: FIXED_CLOCK,
  });
  const runtimeEnvironmentService = createRuntimeEnvironmentService({
    clock: FIXED_CLOCK,
  });
  const unifiedWorkspaceService = createTestUnifiedWorkspaceServiceForDashboard({
    clock: FIXED_CLOCK,
  });

  return {
    athleteIdentityService,
    runtimeEnvironmentService,
    unifiedWorkspaceService,
    workoutRuntimePersistenceService: createWorkoutRuntimePersistenceService(),
    nutritionRuntimePersistenceService: createNutritionRuntimePersistenceService(),
    recoveryRuntimePersistenceService: createRecoveryRuntimePersistenceService(),
  };
}

function buildIdentity(
  services: ReturnType<typeof createObservedServices>,
  requestId: string,
) {
  return services.athleteIdentityService.build({
    athleteId: ATHLETE_ID,
    requestId,
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
}

/** Flushes microtasks so fire-and-forget `void persist(...).catch(...)` chains settle. */
async function flushMicrotasks(times = 5): Promise<void> {
  for (let index = 0; index < times; index += 1) {
    await Promise.resolve();
  }
}

describe("Sprint 36.4 — Runtime Persistence Failure Recovery (observer core)", () => {
  afterEach(() => {
    resetRuntimeObserver();
    resetRuntimeWriteThrough();
    resetDashboardRestore();
    resetRepositoryHydration();
    resetRuntimeBootstrap();
    resetCompositionRoot();
    jest.restoreAllMocks();
  });

  it("persists successfully on a runtime mutation and leaves the observer ready", async () => {
    RuntimeBootstrap.bootstrap({ clock: FIXED_CLOCK });
    resetCompositionRoot();

    const services = createObservedServices();
    const persist = jest.fn().mockResolvedValue({
      status: "ready",
      identityRecordCount: 1,
      runtimeRecordCount: 0,
      workspaceRecordCount: 0,
      persistedAt: FIXED_CLOCK(),
      phases: [],
    });

    RuntimeObserver.start({
      athleteIds: [ATHLETE_ID],
      deps: { ...services, persist, clock: FIXED_CLOCK },
    });

    const result = buildIdentity(services, "core:success:1");

    expect(result.success).toBe(true);
    expect(persist).toHaveBeenCalledTimes(1);
    expect(getRuntimeObserverStatus()).toBe(RUNTIME_OBSERVER_STATUS.ready);
  });

  it("a repository/write-through failure does not roll back the in-memory runtime mutation", async () => {
    RuntimeBootstrap.bootstrap({ clock: FIXED_CLOCK });
    resetCompositionRoot();

    const services = createObservedServices();
    const persist = jest
      .fn()
      .mockRejectedValueOnce(new Error("repository contract rejected write"));

    RuntimeObserver.start({
      athleteIds: [ATHLETE_ID],
      deps: { ...services, persist, clock: FIXED_CLOCK },
    });

    const result = buildIdentity(services, "core:failure:1");
    await flushMicrotasks();

    // The domain mutation succeeded and is retained in memory regardless of
    // the downstream persistence outcome — persistence failure must never
    // undo a valid runtime mutation.
    expect(result.success).toBe(true);
    expect(
      services.athleteIdentityService.getAthleteIdentity(ATHLETE_ID)?.profile
        .displayName,
    ).toBe("Alex Rivera");
    expect(persist).toHaveBeenCalledTimes(1);
  });

  it("a rejected persist promise does not surface as an unhandled rejection and does not throw from build()", async () => {
    RuntimeBootstrap.bootstrap({ clock: FIXED_CLOCK });
    resetCompositionRoot();

    const unhandledRejections: unknown[] = [];
    const onUnhandledRejection = (reason: unknown) => {
      unhandledRejections.push(reason);
    };
    process.on("unhandledRejection", onUnhandledRejection);

    try {
      const services = createObservedServices();
      const persist = jest
        .fn()
        .mockRejectedValueOnce(new Error("repository contract rejected write"));

      RuntimeObserver.start({
        deps: { ...services, persist, clock: FIXED_CLOCK },
      });

      expect(() => buildIdentity(services, "core:no-unhandled-rejection:1")).not.toThrow();
      await flushMicrotasks(10);

      expect(unhandledRejections).toHaveLength(0);
    } finally {
      process.off("unhandledRejection", onUnhandledRejection);
    }
  });

  it("logs the write-through failure through the existing logging abstraction without affecting observer status", async () => {
    RuntimeBootstrap.bootstrap({ clock: FIXED_CLOCK });
    resetCompositionRoot();

    const errorSpy = jest.spyOn(MockLogger.prototype, "error");

    const services = createObservedServices();
    const persist = jest
      .fn()
      .mockRejectedValueOnce(new Error("repository contract rejected write"));

    RuntimeObserver.start({
      deps: { ...services, persist, clock: FIXED_CLOCK },
    });

    buildIdentity(services, "core:logging:1");
    await flushMicrotasks();

    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining("write-through"),
      expect.objectContaining({ scope: "Application" }),
    );
    expect(getRuntimeObserverStatus()).toBe(RUNTIME_OBSERVER_STATUS.ready);
  });

  it("observer remains installed after a persistence failure — a later mutation still triggers persist", async () => {
    RuntimeBootstrap.bootstrap({ clock: FIXED_CLOCK });
    resetCompositionRoot();

    const services = createObservedServices();
    const persist = jest
      .fn()
      .mockRejectedValueOnce(new Error("repository contract rejected write"))
      .mockResolvedValueOnce({
        status: "ready",
        identityRecordCount: 1,
        runtimeRecordCount: 0,
        workspaceRecordCount: 0,
        persistedAt: FIXED_CLOCK(),
        phases: [],
      });

    RuntimeObserver.start({
      athleteIds: [ATHLETE_ID],
      deps: { ...services, persist, clock: FIXED_CLOCK },
    });

    buildIdentity(services, "core:recover:1");
    await flushMicrotasks();
    expect(getRuntimeObserverStatus()).toBe(RUNTIME_OBSERVER_STATUS.ready);

    services.runtimeEnvironmentService.build({
      requestId: "core:recover:runtime:1",
      device: {
        deviceId: "runtime:recover:1",
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

    // No RuntimeObserver.start() call happened between the two mutations —
    // the same installed wrapper handled both the failed and the recovered
    // persist, proving no observer restart was required.
    expect(persist).toHaveBeenCalledTimes(2);
    expect(getRuntimeObserverStatus()).toBe(RUNTIME_OBSERVER_STATUS.ready);
  });

  it("resets write-through before every persist call, including the recovery persist after a failure", async () => {
    RuntimeBootstrap.bootstrap({ clock: FIXED_CLOCK });
    resetCompositionRoot();

    const services = createObservedServices();
    const resetWriteThrough = jest.fn();
    const persist = jest
      .fn()
      .mockRejectedValueOnce(new Error("repository contract rejected write"))
      .mockResolvedValueOnce({
        status: "ready",
        identityRecordCount: 1,
        runtimeRecordCount: 0,
        workspaceRecordCount: 0,
        persistedAt: FIXED_CLOCK(),
        phases: [],
      });

    RuntimeObserver.start({
      athleteIds: [ATHLETE_ID],
      deps: { ...services, persist, resetWriteThrough, clock: FIXED_CLOCK },
    });

    buildIdentity(services, "core:reset-before-recovery:1");
    await flushMicrotasks();
    expect(resetWriteThrough).toHaveBeenCalledTimes(1);
    expect(persist).toHaveBeenCalledTimes(1);

    buildIdentity(services, "core:reset-before-recovery:2");
    await flushMicrotasks();

    // Reset happened again immediately before the recovery persist call —
    // proving recovery reuses the existing reset API rather than persisting
    // over the stale failed state.
    expect(resetWriteThrough).toHaveBeenCalledTimes(2);
    expect(persist).toHaveBeenCalledTimes(2);
  });

  it("does not create duplicate observer wrappers across a failure/recovery cycle", async () => {
    RuntimeBootstrap.bootstrap({ clock: FIXED_CLOCK });
    resetCompositionRoot();

    const services = createObservedServices();
    const persist = jest
      .fn()
      .mockRejectedValueOnce(new Error("repository contract rejected write"))
      .mockResolvedValueOnce({
        status: "ready",
        identityRecordCount: 1,
        runtimeRecordCount: 0,
        workspaceRecordCount: 0,
        persistedAt: FIXED_CLOCK(),
        phases: [],
      })
      .mockResolvedValueOnce({
        status: "ready",
        identityRecordCount: 1,
        runtimeRecordCount: 0,
        workspaceRecordCount: 0,
        persistedAt: FIXED_CLOCK(),
        phases: [],
      });

    RuntimeObserver.start({
      deps: { ...services, persist, clock: FIXED_CLOCK },
    });

    buildIdentity(services, "core:no-duplicate:1");
    await flushMicrotasks();
    buildIdentity(services, "core:no-duplicate:2");
    await flushMicrotasks();
    buildIdentity(services, "core:no-duplicate:3");
    await flushMicrotasks();

    // Exactly one persist call per successful build() — a duplicate wrapper
    // would double (or more) this count.
    expect(persist).toHaveBeenCalledTimes(3);
  });

  it("does not touch Runtime Session state on a persistence failure — session lifecycle is a separate concern", async () => {
    RuntimeBootstrap.bootstrap({ clock: FIXED_CLOCK });
    resetCompositionRoot();

    const services = createObservedServices();
    const persist = jest
      .fn()
      .mockRejectedValueOnce(new Error("repository contract rejected write"));

    RuntimeObserver.start({
      deps: { ...services, persist, clock: FIXED_CLOCK },
    });

    buildIdentity(services, "core:session-unaffected:1");
    await flushMicrotasks();

    // The observer's own status (the only lifecycle state it owns) remains
    // "ready" — a write-through/persistence failure never flips it to
    // "failed" and therefore can never be mistaken for a Runtime Session
    // failure by any consumer reading observer/session status.
    expect(getRuntimeObserverStatus()).toBe(RUNTIME_OBSERVER_STATUS.ready);
  });

  it("real write-through pipeline: reflects failed status while runtime services keep their in-memory state, then recovers to ready on the next mutation", async () => {
    RuntimeBootstrap.bootstrap({ clock: FIXED_CLOCK });
    resetCompositionRoot();

    const root = getCompositionRoot();
    const adapters = root.resolve("RepositoryAdapters");
    const saveSpy = jest
      .spyOn(adapters.identity, "save")
      .mockImplementationOnce(() => {
        throw new Error("simulated repository failure");
      });

    observeRuntime({ athleteIds: [ATHLETE_ID], clock: FIXED_CLOCK });

    root.resolve("AthleteIdentityService").build({
      athleteId: ATHLETE_ID,
      requestId: `core:real-pipeline:identity:${ATHLETE_ID}`,
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

    for (let index = 0; index < 10; index += 1) {
      const inFlight = getRuntimeWriteThroughPromise();
      if (inFlight) {
        await inFlight.catch(() => undefined);
      }
      if (getWriteThroughStatus() === RUNTIME_WRITE_THROUGH_STATUS.failed) {
        break;
      }
      await Promise.resolve();
    }

    expect(getWriteThroughStatus()).toBe(RUNTIME_WRITE_THROUGH_STATUS.failed);
    expect(
      root.resolve("AthleteIdentityService").getAthleteIdentity(ATHLETE_ID)
        ?.profile.displayName,
    ).toBe("Alex Rivera");
    expect(getRuntimeObserverStatus()).toBe(RUNTIME_OBSERVER_STATUS.ready);

    saveSpy.mockRestore();

    root.resolve("RuntimeEnvironmentService").build({
      requestId: "core:real-pipeline:runtime:1",
      device: {
        deviceId: "runtime:real-pipeline:1",
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

    for (let index = 0; index < 20; index += 1) {
      const inFlight = getRuntimeWriteThroughPromise();
      if (inFlight) {
        await inFlight.catch(() => undefined);
      }
      if (getWriteThroughStatus() === RUNTIME_WRITE_THROUGH_STATUS.ready) {
        break;
      }
      await Promise.resolve();
    }

    expect(getWriteThroughStatus()).toBe(RUNTIME_WRITE_THROUGH_STATUS.ready);

    const savedIdentity = adapters.identity
      .list()
      .find((record) => record.id === ATHLETE_ID);
    expect(savedIdentity).toBeDefined();
  });
});

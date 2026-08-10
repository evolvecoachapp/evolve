import { resetCompositionRoot, getCompositionRoot } from "../../../core/composition/createCompositionRoot";
import { createAthleteIdentityService } from "../../../features/athlete-identity/services/AthleteIdentityService";
import { createRuntimeEnvironmentService } from "../../../features/runtime-environment/services/RuntimeEnvironmentService";
import {
  composeTestWorkspaceForAthlete,
  createTestUnifiedWorkspaceServiceForDashboard,
  FIXED_DASHBOARD_ATHLETE_ID,
} from "../../../integrations/dashboard-projection/testSupport/fixtures";
import { RuntimeBootstrap, resetRuntimeBootstrap } from "../../bootstrap/RuntimeBootstrap";
import { resetDashboardRestore } from "../../dashboard-restore/DashboardRestorePipeline";
import { resetRepositoryHydration } from "../../hydration/RepositoryHydrationPipeline";
import { getWriteThroughStatus } from "../../write-through/application";
import { RUNTIME_WRITE_THROUGH_STATUS } from "../../write-through/RuntimeWriteThroughStatus";
import { resetRuntimeWriteThrough } from "../../write-through/RuntimeWriteThroughPipeline";
import {
  createMockIdentityRepository,
  createMockRuntimeRepository,
  createMockWorkspaceRepository,
} from "../../write-through/testSupport/mockRepositories";
import { observeRuntime, getRuntimeObserverStatus } from "../application";
import { RUNTIME_OBSERVER_PHASES } from "../RuntimeObserverInitialization";
import { RUNTIME_OBSERVER_STATUS } from "../RuntimeObserverStatus";
import { RuntimeObserver, resetRuntimeObserver } from "../RuntimeObserver";
import { RuntimeObserverError } from "../RuntimeObserverError";

const FIXED_CLOCK = () => "2026-08-10T10:00:00.000Z";
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
  };
}

describe("RuntimeObserver lifecycle", () => {
  afterEach(() => {
    resetRuntimeObserver();
    resetRuntimeWriteThrough();
    resetDashboardRestore();
    resetRepositoryHydration();
    resetRuntimeBootstrap();
    resetCompositionRoot();
  });

  it("wraps runtime services and triggers persistRuntime on successful build", async () => {
    RuntimeBootstrap.bootstrap({ clock: FIXED_CLOCK });
    resetCompositionRoot();

    const services = createObservedServices();
    const identityRepository = createMockIdentityRepository();
    const runtimeRepository = createMockRuntimeRepository();
    const workspaceRepository = createMockWorkspaceRepository();
    const persist = jest.fn().mockResolvedValue({
      status: "ready",
      identityRecordCount: 1,
      runtimeRecordCount: 1,
      workspaceRecordCount: 1,
      persistedAt: FIXED_CLOCK(),
      phases: [],
    });

    RuntimeObserver.start({
      athleteIds: [ATHLETE_ID],
      deps: {
        ...services,
        persist,
        clock: FIXED_CLOCK,
      },
    });

    services.athleteIdentityService.build({
      athleteId: ATHLETE_ID,
      requestId: `observer:identity:${ATHLETE_ID}`,
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

    expect(persist).toHaveBeenCalledTimes(1);
    expect(persist).toHaveBeenCalledWith({ athleteIds: [ATHLETE_ID] });

    services.runtimeEnvironmentService.build({
      requestId: "observer:runtime:1",
      device: {
        deviceId: "runtime:observer:1",
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

    expect(persist).toHaveBeenCalledTimes(2);

    unifiedWorkspaceServiceBuild(services.unifiedWorkspaceService);
    expect(persist).toHaveBeenCalledTimes(3);
    expect(getRuntimeObserverStatus()).toBe(RUNTIME_OBSERVER_STATUS.ready);

    void identityRepository;
    void runtimeRepository;
    void workspaceRepository;
  });

  it("does not trigger persistRuntime when build fails", () => {
    RuntimeBootstrap.bootstrap({ clock: FIXED_CLOCK });

    const services = createObservedServices();
    const persist = jest.fn();

    RuntimeObserver.start({
      deps: {
        ...services,
        persist,
        clock: FIXED_CLOCK,
      },
    });

    services.athleteIdentityService.build({
      athleteId: "",
      requestId: "observer:invalid",
      profile: {
        displayName: "",
        givenName: "",
        familyName: "",
        sex: "unspecified",
        birthYear: 1990,
        experienceLevel: "intermediate",
      },
      locale: { languageTag: "en-US" },
      units: { system: "metric" },
      timeZone: { iana: "Etc/UTC", displayName: "UTC" },
    });

    expect(persist).not.toHaveBeenCalled();
  });

  it("returns the same result from observeRuntime when called twice", () => {
    RuntimeBootstrap.bootstrap({ clock: FIXED_CLOCK });

    const first = observeRuntime({
      athleteIds: [ATHLETE_ID],
      clock: FIXED_CLOCK,
    });
    const second = observeRuntime();

    expect(second).toBe(first);
    expect(first.phases).toEqual([...RUNTIME_OBSERVER_PHASES]);
    expect(getRuntimeObserverStatus()).toBe(RUNTIME_OBSERVER_STATUS.ready);
  });

  it("requires bootstrap readiness before observation starts", () => {
    const services = createObservedServices();

    expect(() =>
      RuntimeObserver.start({
        deps: {
          ...services,
          clock: FIXED_CLOCK,
        },
      }),
    ).toThrow(RuntimeObserverError);
    expect(getRuntimeObserverStatus()).toBe(RUNTIME_OBSERVER_STATUS.failed);
  });

  it("prevents duplicate observer starts", () => {
    RuntimeBootstrap.bootstrap({ clock: FIXED_CLOCK });
    const services = createObservedServices();

    RuntimeObserver.start({
      deps: {
        ...services,
        persist: jest.fn().mockResolvedValue({}),
        clock: FIXED_CLOCK,
      },
    });

    expect(() =>
      RuntimeObserver.start({
        deps: {
          ...services,
          clock: FIXED_CLOCK,
        },
      }),
    ).toThrow(/already started/i);
  });

  it("resets write-through before each automatic persist invocation", async () => {
    RuntimeBootstrap.bootstrap({ clock: FIXED_CLOCK });
    resetCompositionRoot();

    const services = createObservedServices();
    const resetWriteThrough = jest.fn();
    const persist = jest
      .fn()
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
        runtimeRecordCount: 1,
        workspaceRecordCount: 0,
        persistedAt: FIXED_CLOCK(),
        phases: [],
      });

    RuntimeObserver.start({
      athleteIds: [ATHLETE_ID],
      deps: {
        ...services,
        persist,
        resetWriteThrough,
        clock: FIXED_CLOCK,
      },
    });

    services.athleteIdentityService.build({
      athleteId: ATHLETE_ID,
      requestId: `observer:identity:${ATHLETE_ID}`,
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

    services.runtimeEnvironmentService.build({
      requestId: "observer:runtime:2",
      device: {
        deviceId: "runtime:observer:2",
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

    await Promise.resolve();

    expect(resetWriteThrough).toHaveBeenCalledTimes(2);
    expect(persist).toHaveBeenCalledTimes(2);
  });

  it("integrates observeRuntime with composition root write-through", async () => {
    RuntimeBootstrap.bootstrap({ clock: FIXED_CLOCK });

    observeRuntime({ athleteIds: [ATHLETE_ID], clock: FIXED_CLOCK });

    const root = getCompositionRoot();
    root.resolve("AthleteIdentityService").build({
      athleteId: ATHLETE_ID,
      requestId: `observer:integration:${ATHLETE_ID}`,
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

    for (let index = 0; index < 5; index += 1) {
      await Promise.resolve();
    }

    expect(getWriteThroughStatus()).toBe(RUNTIME_WRITE_THROUGH_STATUS.ready);
  });

  it("unwraps service build methods on reset", () => {
    RuntimeBootstrap.bootstrap({ clock: FIXED_CLOCK });
    const services = createObservedServices();
    const persist = jest.fn().mockResolvedValue({});

    RuntimeObserver.start({
      deps: {
        ...services,
        persist,
        clock: FIXED_CLOCK,
      },
    });

    services.athleteIdentityService.build({
      athleteId: ATHLETE_ID,
      requestId: `observer:identity:${ATHLETE_ID}`,
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

    expect(persist).toHaveBeenCalledTimes(1);

    resetRuntimeObserver();

    services.athleteIdentityService.build({
      athleteId: ATHLETE_ID,
      requestId: `observer:identity:${ATHLETE_ID}:again`,
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

    expect(persist).toHaveBeenCalledTimes(1);
    expect(getRuntimeObserverStatus()).toBe(RUNTIME_OBSERVER_STATUS.idle);
  });
});

function unifiedWorkspaceServiceBuild(
  unifiedWorkspaceService: ReturnType<
    typeof createTestUnifiedWorkspaceServiceForDashboard
  >,
) {
  unifiedWorkspaceService.build({
    athleteId: ATHLETE_ID,
    requestId: `observer:workspace:${ATHLETE_ID}`,
  });
  composeTestWorkspaceForAthlete(unifiedWorkspaceService, ATHLETE_ID);
}

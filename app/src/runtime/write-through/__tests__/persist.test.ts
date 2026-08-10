import { resetCompositionRoot } from "../../../core/composition/createCompositionRoot";
import {
  composeTestWorkspaceForAthlete,
  FIXED_DASHBOARD_ATHLETE_ID,
} from "../../../integrations/dashboard-projection/testSupport/fixtures";
import { RuntimeBootstrap, resetRuntimeBootstrap } from "../../bootstrap/RuntimeBootstrap";
import { resetRepositoryHydration } from "../../hydration/RepositoryHydrationPipeline";
import { resetDashboardRestore } from "../../dashboard-restore/DashboardRestorePipeline";
import {
  createTestRuntimeServices,
  createWriteThroughTestDeps,
} from "../../testSupport/runtimePersistenceFixtures";
import { persistRuntime, getWriteThroughStatus } from "../application";
import { RUNTIME_WRITE_THROUGH_PHASES } from "../RuntimeWriteThroughInitialization";
import { RUNTIME_WRITE_THROUGH_STATUS } from "../RuntimeWriteThroughStatus";
import {
  RuntimeWriteThroughPipeline,
  resetRuntimeWriteThrough,
} from "../RuntimeWriteThroughPipeline";
import { RuntimeWriteThroughError } from "../RuntimeWriteThroughError";
import {
  createMockIdentityRepository,
  createMockRuntimeRepository,
  createMockSnapshotRepository,
  createMockTimelineRepository,
  createMockWorkspaceRepository,
} from "../testSupport/mockRepositories";
import { readRecordPayload } from "../../persistence/DomainRecord";
import type { AthleteIdentity } from "../../../features/athlete-identity/models/AthleteIdentity";
import type { RuntimeEnvironment } from "../../../features/runtime-environment/models/RuntimeEnvironment";
import type { Workspace } from "../../../features/unified-workspace/models/Workspace";

const FIXED_CLOCK = () => "2026-08-10T10:00:00.000Z";
const ATHLETE_ID = FIXED_DASHBOARD_ATHLETE_ID;

function bootstrapRuntimeWithState() {
  RuntimeBootstrap.bootstrap({ clock: FIXED_CLOCK });
  const services = createTestRuntimeServices(FIXED_CLOCK);

  services.athleteIdentityService.build({
    athleteId: ATHLETE_ID,
    requestId: `write-through:identity:${ATHLETE_ID}`,
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
    requestId: "write-through:runtime:1",
    device: {
      deviceId: "runtime:write-through:1",
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

  services.unifiedWorkspaceService.build({
    athleteId: ATHLETE_ID,
    requestId: `write-through:workspace:${ATHLETE_ID}`,
  });
  composeTestWorkspaceForAthlete(services.unifiedWorkspaceService, ATHLETE_ID);

  return services;
}

function createPersistDepsFromServices(
  services: ReturnType<typeof createTestRuntimeServices>,
) {
  return {
    ...services,
    identityRepository: createMockIdentityRepository(),
    runtimeRepository: createMockRuntimeRepository(),
    workspaceRepository: createMockWorkspaceRepository(),
    snapshotRepository: createMockSnapshotRepository(),
    timelineRepository: createMockTimelineRepository(),
    clock: FIXED_CLOCK,
  };
}

describe("RuntimeWriteThroughPipeline", () => {
  afterEach(() => {
    resetRuntimeWriteThrough();
    resetDashboardRestore();
    resetRepositoryHydration();
    resetRuntimeBootstrap();
    resetCompositionRoot();
  });

  it("persists runtime state through repository contracts after bootstrap completes", async () => {
    const services = bootstrapRuntimeWithState();
    const identityRepository = createMockIdentityRepository();
    const runtimeRepository = createMockRuntimeRepository();
    const workspaceRepository = createMockWorkspaceRepository();

    const result = await RuntimeWriteThroughPipeline.persist({
      athleteIds: [ATHLETE_ID],
      deps: {
        ...createPersistDepsFromServices(services),
        identityRepository,
        runtimeRepository,
        workspaceRepository,
      },
    });

    expect(result.identityRecordCount).toBe(1);
    expect(result.runtimeRecordCount).toBe(1);
    expect(result.workspaceRecordCount).toBe(1);
    expect(result.phases).toEqual(RUNTIME_WRITE_THROUGH_PHASES);
    expect(getWriteThroughStatus()).toBe(RUNTIME_WRITE_THROUGH_STATUS.ready);

    const identityList = identityRepository.list();
    const runtimeList = runtimeRepository.list();
    const workspaceList = workspaceRepository.list();
    const savedIdentity = readRecordPayload<AthleteIdentity>(
      (Array.isArray(identityList) ? identityList : [])[0],
    );
    const savedRuntime = readRecordPayload<RuntimeEnvironment>(
      (Array.isArray(runtimeList) ? runtimeList : [])[0],
    );
    const savedWorkspace = readRecordPayload<Workspace>(
      (Array.isArray(workspaceList) ? workspaceList : [])[0],
    );

    expect(savedIdentity?.profile.displayName).toBe("Alex Rivera");
    expect(savedRuntime?.device.model).toBe("Test Device");
    expect(savedWorkspace?.athleteId).toBe(ATHLETE_ID);
  });

  it("succeeds with zero records when runtime services are empty", async () => {
    RuntimeBootstrap.bootstrap({ clock: FIXED_CLOCK });

    const result = await RuntimeWriteThroughPipeline.persist({
      deps: createWriteThroughTestDeps(FIXED_CLOCK),
    });

    expect(result.identityRecordCount).toBe(0);
    expect(result.runtimeRecordCount).toBe(0);
    expect(result.workspaceRecordCount).toBe(0);
  });

  it("prevents duplicate persist starts", async () => {
    const services = bootstrapRuntimeWithState();
    const deps = createPersistDepsFromServices(services);

    await RuntimeWriteThroughPipeline.persist({ athleteIds: [ATHLETE_ID], deps });

    await expect(
      RuntimeWriteThroughPipeline.persist({ athleteIds: [ATHLETE_ID], deps }),
    ).rejects.toThrow(RuntimeWriteThroughError);
    await expect(
      RuntimeWriteThroughPipeline.persist({ athleteIds: [ATHLETE_ID], deps }),
    ).rejects.toThrow(/already started/i);
  });

  it("requires bootstrap readiness before persist", async () => {
    const services = bootstrapRuntimeWithState();
    resetRuntimeBootstrap();

    await expect(
      RuntimeWriteThroughPipeline.persist({
        athleteIds: [ATHLETE_ID],
        deps: createPersistDepsFromServices(services),
      }),
    ).rejects.toThrow(/bootstrap must complete/i);
  });

  it("returns deterministic failure when repositories reject writes without mutating runtime services", async () => {
    const services = bootstrapRuntimeWithState();
    const identityBefore = services.athleteIdentityService.getAthleteIdentity(
      ATHLETE_ID,
    );
    const runtimeBefore =
      services.runtimeEnvironmentService.getRuntimeEnvironment();
    const workspaceBefore =
      services.unifiedWorkspaceService.getWorkspace(ATHLETE_ID);

    await expect(
      RuntimeWriteThroughPipeline.persist({
        athleteIds: [ATHLETE_ID],
        deps: {
          ...createPersistDepsFromServices(services),
          identityRepository: createMockIdentityRepository([], {
            rejectSave: true,
          }),
        },
      }),
    ).rejects.toMatchObject({
      code: "repository_contract_failed",
    });

    expect(getWriteThroughStatus()).toBe(RUNTIME_WRITE_THROUGH_STATUS.failed);
    expect(services.athleteIdentityService.getAthleteIdentity(ATHLETE_ID)).toBe(
      identityBefore,
    );
    expect(services.runtimeEnvironmentService.getRuntimeEnvironment()).toBe(
      runtimeBefore,
    );
    expect(services.unifiedWorkspaceService.getWorkspace(ATHLETE_ID)).toBe(
      workspaceBefore,
    );
  });

  it("persistRuntime application API is idempotent", async () => {
    RuntimeBootstrap.bootstrap({ clock: FIXED_CLOCK });
    resetCompositionRoot();

    const first = persistRuntime({ athleteIds: [ATHLETE_ID] });
    const second = persistRuntime({ athleteIds: [ATHLETE_ID] });

    expect(first).toBe(second);

    await first;
    expect(getWriteThroughStatus()).toBe(RUNTIME_WRITE_THROUGH_STATUS.ready);
  });
});

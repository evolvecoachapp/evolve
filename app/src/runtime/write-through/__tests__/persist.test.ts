import { resetCompositionRoot } from "../../../core/composition/createCompositionRoot";
import { createAthleteIdentityService } from "../../../features/athlete-identity/services/AthleteIdentityService";
import { createRuntimeEnvironmentService } from "../../../features/runtime-environment/services/RuntimeEnvironmentService";
import { createUnifiedWorkspaceService } from "../../../features/unified-workspace/services/UnifiedWorkspaceService";
import {
  composeTestWorkspaceForAthlete,
  createTestUnifiedWorkspaceServiceForDashboard,
  FIXED_DASHBOARD_ATHLETE_ID,
} from "../../../integrations/dashboard-projection/testSupport/fixtures";
import { RuntimeBootstrap, resetRuntimeBootstrap } from "../../bootstrap/RuntimeBootstrap";
import { resetRepositoryHydration } from "../../hydration/RepositoryHydrationPipeline";
import { resetDashboardRestore } from "../../dashboard-restore/DashboardRestorePipeline";
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
  createMockWorkspaceRepository,
} from "../testSupport/mockRepositories";

const FIXED_CLOCK = () => "2026-08-10T10:00:00.000Z";
const ATHLETE_ID = FIXED_DASHBOARD_ATHLETE_ID;

function bootstrapRuntimeWithState() {
  RuntimeBootstrap.bootstrap({ clock: FIXED_CLOCK });

  const athleteIdentityService = createAthleteIdentityService({
    clock: FIXED_CLOCK,
  });
  const runtimeEnvironmentService = createRuntimeEnvironmentService({
    clock: FIXED_CLOCK,
  });
  const unifiedWorkspaceService = createTestUnifiedWorkspaceServiceForDashboard({
    clock: FIXED_CLOCK,
  });

  athleteIdentityService.build({
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

  runtimeEnvironmentService.build({
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

  unifiedWorkspaceService.build({
    athleteId: ATHLETE_ID,
    requestId: `write-through:workspace:${ATHLETE_ID}`,
  });
  composeTestWorkspaceForAthlete(unifiedWorkspaceService, ATHLETE_ID);

  return {
    athleteIdentityService,
    runtimeEnvironmentService,
    unifiedWorkspaceService,
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
        ...services,
        identityRepository,
        runtimeRepository,
        workspaceRepository,
        clock: FIXED_CLOCK,
      },
    });

    expect(result.identityRecordCount).toBe(1);
    expect(result.runtimeRecordCount).toBe(1);
    expect(result.workspaceRecordCount).toBe(1);
    expect(result.phases).toEqual(RUNTIME_WRITE_THROUGH_PHASES);
    expect(getWriteThroughStatus()).toBe(RUNTIME_WRITE_THROUGH_STATUS.ready);
    expect(identityRepository.list()).toHaveLength(1);
    expect(runtimeRepository.list()).toHaveLength(1);
    expect(workspaceRepository.list()).toHaveLength(1);
  });

  it("succeeds with zero records when runtime services are empty", async () => {
    RuntimeBootstrap.bootstrap({ clock: FIXED_CLOCK });

    const result = await RuntimeWriteThroughPipeline.persist({
      deps: {
        athleteIdentityService: createAthleteIdentityService({ clock: FIXED_CLOCK }),
        runtimeEnvironmentService: createRuntimeEnvironmentService({
          clock: FIXED_CLOCK,
        }),
        unifiedWorkspaceService: createUnifiedWorkspaceService({
          clock: FIXED_CLOCK,
        }),
        identityRepository: createMockIdentityRepository(),
        runtimeRepository: createMockRuntimeRepository(),
        workspaceRepository: createMockWorkspaceRepository(),
        clock: FIXED_CLOCK,
      },
    });

    expect(result.identityRecordCount).toBe(0);
    expect(result.runtimeRecordCount).toBe(0);
    expect(result.workspaceRecordCount).toBe(0);
  });

  it("prevents duplicate persist starts", async () => {
    const services = bootstrapRuntimeWithState();
    const deps = {
      ...services,
      identityRepository: createMockIdentityRepository(),
      runtimeRepository: createMockRuntimeRepository(),
      workspaceRepository: createMockWorkspaceRepository(),
      clock: FIXED_CLOCK,
    };

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
        deps: {
          ...services,
          identityRepository: createMockIdentityRepository(),
          runtimeRepository: createMockRuntimeRepository(),
          workspaceRepository: createMockWorkspaceRepository(),
          clock: FIXED_CLOCK,
        },
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
          ...services,
          identityRepository: createMockIdentityRepository([], {
            rejectSave: true,
          }),
          runtimeRepository: createMockRuntimeRepository(),
          workspaceRepository: createMockWorkspaceRepository(),
          clock: FIXED_CLOCK,
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

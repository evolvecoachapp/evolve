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
import { createRuntimeWriteThroughState } from "../RuntimeWriteThroughState";
import { RUNTIME_WRITE_THROUGH_STATUS } from "../RuntimeWriteThroughStatus";
import { RuntimeWriteThroughError } from "../RuntimeWriteThroughError";
import {
  RuntimeWriteThroughPipeline,
  resetRuntimeWriteThrough,
} from "../RuntimeWriteThroughPipeline";
import {
  validateBootstrapReadyForWriteThrough,
  validateRuntimeWriteThroughCanStart,
  validateRuntimeWriteThroughState,
} from "../RuntimeWriteThroughValidation";

describe("runtime write-through validation", () => {
  afterEach(() => {
    resetRuntimeWriteThrough();
    resetDashboardRestore();
    resetRepositoryHydration();
    resetRuntimeBootstrap();
    resetCompositionRoot();
  });

  it("validates write-through state invariants", () => {
    expect(() =>
      validateRuntimeWriteThroughState(
        createRuntimeWriteThroughState({
          status: RUNTIME_WRITE_THROUGH_STATUS.ready,
          result: null,
        }),
      ),
    ).toThrow(RuntimeWriteThroughError);

    expect(() =>
      validateRuntimeWriteThroughState(
        createRuntimeWriteThroughState({
          status: RUNTIME_WRITE_THROUGH_STATUS.failed,
          error: null,
        }),
      ),
    ).toThrow(RuntimeWriteThroughError);

    expect(() =>
      validateRuntimeWriteThroughState(
        createRuntimeWriteThroughState({
          status: RUNTIME_WRITE_THROUGH_STATUS.persisting,
          completedAt: "2026-08-10T10:00:00.000Z",
        }),
      ),
    ).toThrow(RuntimeWriteThroughError);
  });

  it("prevents duplicate persist starts", () => {
    expect(() =>
      validateRuntimeWriteThroughCanStart(
        createRuntimeWriteThroughState({
          status: RUNTIME_WRITE_THROUGH_STATUS.persisting,
        }),
      ),
    ).toThrow(/already started/i);

    expect(() =>
      validateRuntimeWriteThroughCanStart(
        createRuntimeWriteThroughState({
          status: RUNTIME_WRITE_THROUGH_STATUS.ready,
        }),
      ),
    ).toThrow(/already started/i);
  });

  it("requires bootstrap readiness before write-through", () => {
    expect(() => validateBootstrapReadyForWriteThrough()).toThrow(
      /bootstrap must complete/i,
    );
  });

  it("allows write-through when bootstrap is ready", () => {
    RuntimeBootstrap.bootstrap();
    expect(() => validateBootstrapReadyForWriteThrough()).not.toThrow();
  });
});

describe("runtime write-through repository contract usage", () => {
  afterEach(() => {
    resetRuntimeWriteThrough();
    resetDashboardRestore();
    resetRepositoryHydration();
    resetRuntimeBootstrap();
    resetCompositionRoot();
  });

  it("observes athlete identity, runtime environment, and unified workspace identifiers only", async () => {
    RuntimeBootstrap.bootstrap({ clock: () => "2026-08-10T10:00:00.000Z" });

    const athleteId = FIXED_DASHBOARD_ATHLETE_ID;
    const athleteIdentityService = createAthleteIdentityService({
      clock: () => "2026-08-10T10:00:00.000Z",
    });
    const runtimeEnvironmentService = createRuntimeEnvironmentService({
      clock: () => "2026-08-10T10:00:00.000Z",
    });
    const unifiedWorkspaceService = createTestUnifiedWorkspaceServiceForDashboard({
      clock: () => "2026-08-10T10:00:00.000Z",
    });

    athleteIdentityService.build({
      athleteId,
      requestId: `contract:identity:${athleteId}`,
      profile: {
        displayName: "Test Athlete",
        givenName: "Test",
        familyName: "Athlete",
        sex: "unspecified",
        birthYear: 1990,
        experienceLevel: "beginner",
      },
      locale: { languageTag: "en-US" },
      units: { system: "metric" },
      timeZone: { iana: "Etc/UTC", displayName: "UTC" },
    });

    runtimeEnvironmentService.build({
      requestId: "contract:runtime:1",
      device: {
        deviceId: "runtime:contract:1",
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

    unifiedWorkspaceService.build({
      athleteId,
      requestId: `contract:workspace:${athleteId}`,
    });
    composeTestWorkspaceForAthlete(unifiedWorkspaceService, athleteId);

    const savedIds: string[] = [];
    const identityRepository = {
      repositoryId: "identity" as const,
      findById: () => null,
      save: (record: { id: string }) => {
        savedIds.push(`identity:${record.id}`);
      },
      delete: () => undefined,
      list: () => [],
      exists: () => false,
    };
    const runtimeRepository = {
      repositoryId: "runtime" as const,
      findById: () => null,
      save: (record: { id: string }) => {
        savedIds.push(`runtime:${record.id}`);
      },
      delete: () => undefined,
      list: () => [],
      exists: () => false,
    };
    const workspaceRepository = {
      repositoryId: "workspace" as const,
      findById: () => null,
      save: (record: { id: string }) => {
        savedIds.push(`workspace:${record.id}`);
      },
      delete: () => undefined,
      list: () => [],
      exists: () => false,
    };

    await RuntimeWriteThroughPipeline.persist({
      athleteIds: [athleteId],
      deps: {
        athleteIdentityService,
        runtimeEnvironmentService,
        unifiedWorkspaceService,
        identityRepository,
        runtimeRepository,
        workspaceRepository,
        clock: () => "2026-08-10T10:00:00.000Z",
      },
    });

    expect(savedIds).toEqual([
      `identity:${athleteId}`,
      expect.stringMatching(/^runtime:/),
      `workspace:${athleteId}`,
    ]);
  });
});

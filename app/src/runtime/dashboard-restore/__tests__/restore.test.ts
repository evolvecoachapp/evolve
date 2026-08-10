import { resetCompositionRoot } from "../../../core/composition/createCompositionRoot";
import { createAthleteIdentityService } from "../../../features/athlete-identity/services/AthleteIdentityService";
import { createRuntimeEnvironmentService } from "../../../features/runtime-environment/services/RuntimeEnvironmentService";
import { HomeDashboardViewModel } from "../../../features/home/viewmodels/HomeDashboardViewModel";
import { createDashboardProjector } from "../../../integrations/dashboard-projection/projector/DashboardProjector";
import {
  composeTestWorkspaceForAthlete,
  createTestUnifiedWorkspaceServiceForDashboard,
  FIXED_DASHBOARD_ATHLETE_ID,
  FIXED_DASHBOARD_PROJECTED_AT,
} from "../../../integrations/dashboard-projection/testSupport/fixtures";
import { RuntimeBootstrap, resetRuntimeBootstrap } from "../../bootstrap/RuntimeBootstrap";
import {
  RepositoryHydrationPipeline,
  resetRepositoryHydration,
} from "../../hydration/RepositoryHydrationPipeline";
import { restoreDashboard, getDashboardRestoreStatus } from "../application";
import { DASHBOARD_RESTORE_PHASES } from "../DashboardRestoreInitialization";
import { DASHBOARD_RESTORE_STATUS } from "../DashboardRestoreStatus";
import {
  DashboardRestorePipeline,
  resetDashboardRestore,
} from "../DashboardRestorePipeline";
import { DashboardRestoreError } from "../DashboardRestoreError";
import {
  createMockIdentityRepository,
  createMockRuntimeRepository,
  createMockWorkspaceRepository,
  createRecord,
} from "../testSupport/mockRepositories";

async function bootstrapHydratedRuntime(options?: {
  readonly unifiedWorkspaceService?: ReturnType<
    typeof createTestUnifiedWorkspaceServiceForDashboard
  >;
  readonly athleteId?: string;
  readonly composeWorkspace?: boolean;
}) {
  RuntimeBootstrap.bootstrap({
    clock: () => FIXED_DASHBOARD_PROJECTED_AT,
  });

  const athleteId = options?.athleteId ?? FIXED_DASHBOARD_ATHLETE_ID;
  const athleteIdentityService = createAthleteIdentityService({
    clock: () => FIXED_DASHBOARD_PROJECTED_AT,
  });
  const runtimeEnvironmentService = createRuntimeEnvironmentService({
    clock: () => FIXED_DASHBOARD_PROJECTED_AT,
  });
  const unifiedWorkspaceService =
    options?.unifiedWorkspaceService ??
    createTestUnifiedWorkspaceServiceForDashboard({
      clock: () => FIXED_DASHBOARD_PROJECTED_AT,
    });

  athleteIdentityService.build({
    athleteId,
    requestId: `restore:identity:${athleteId}`,
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

  await RepositoryHydrationPipeline.hydrate({
    deps: {
      identityRepository: createMockIdentityRepository([createRecord(athleteId)]),
      runtimeRepository: createMockRuntimeRepository([createRecord("runtime:1")]),
      workspaceRepository: createMockWorkspaceRepository([createRecord(athleteId)]),
      athleteIdentityService,
      runtimeEnvironmentService,
      unifiedWorkspaceService,
      clock: () => FIXED_DASHBOARD_PROJECTED_AT,
    },
  });

  if (options?.composeWorkspace) {
    composeTestWorkspaceForAthlete(unifiedWorkspaceService, athleteId);
  }

  return {
    athleteId,
    athleteIdentityService,
    unifiedWorkspaceService,
  };
}

describe("DashboardRestorePipeline", () => {
  afterEach(() => {
    resetDashboardRestore();
    resetRepositoryHydration();
    resetRuntimeBootstrap();
    resetCompositionRoot();
  });

  it("restores dashboard from unified workspace after hydration completes", async () => {
    const unifiedWorkspaceService = createTestUnifiedWorkspaceServiceForDashboard({
      clock: () => FIXED_DASHBOARD_PROJECTED_AT,
    });
    const { athleteId, athleteIdentityService } = await bootstrapHydratedRuntime({
      unifiedWorkspaceService,
      composeWorkspace: true,
    });

    const dashboardProjector = createDashboardProjector({
      unifiedWorkspaceService,
      clock: () => FIXED_DASHBOARD_PROJECTED_AT,
    });

    const result = DashboardRestorePipeline.restore({
      athleteIds: [athleteId],
      deps: {
        unifiedWorkspaceService,
        dashboardProjector,
        athleteIdentityService,
        clock: () => FIXED_DASHBOARD_PROJECTED_AT,
      },
    });

    expect(result.status).toBe("ready");
    expect(result.projectedCount).toBe(1);
    expect(result.emptyCount).toBe(0);
    expect(result.restoredAt).toBe(FIXED_DASHBOARD_PROJECTED_AT);
    expect(result.phases).toEqual([...DASHBOARD_RESTORE_PHASES]);
    expect(result.primaryDashboard.isEmpty).toBe(false);
    expect(result.primaryDashboard.athlete.displayName).toBe(FIXED_DASHBOARD_ATHLETE_ID);
    expect(getDashboardRestoreStatus()).toBe(DASHBOARD_RESTORE_STATUS.ready);
  });

  it("succeeds with an empty dashboard when workspace is missing", async () => {
    await bootstrapHydratedRuntime();

    const unifiedWorkspaceService = createTestUnifiedWorkspaceServiceForDashboard({
      clock: () => FIXED_DASHBOARD_PROJECTED_AT,
    });
    const dashboardProjector = createDashboardProjector({
      unifiedWorkspaceService,
      clock: () => FIXED_DASHBOARD_PROJECTED_AT,
    });

    const result = DashboardRestorePipeline.restore({
      athleteIds: [FIXED_DASHBOARD_ATHLETE_ID],
      deps: {
        unifiedWorkspaceService,
        dashboardProjector,
        athleteIdentityService: createAthleteIdentityService(),
      },
    });

    expect(result.emptyCount).toBe(1);
    expect(result.projectedCount).toBe(0);
    expect(result.primaryDashboard.isEmpty).toBe(true);
  });

  it("succeeds with an empty dashboard when no athletes are provided", async () => {
    await bootstrapHydratedRuntime();

    const unifiedWorkspaceService = createTestUnifiedWorkspaceServiceForDashboard();
    const result = DashboardRestorePipeline.restore({
      deps: {
        unifiedWorkspaceService,
        dashboardProjector: createDashboardProjector({ unifiedWorkspaceService }),
        athleteIdentityService: createAthleteIdentityService(),
      },
    });

    expect(result.athleteCount).toBe(0);
    expect(result.emptyCount).toBe(1);
    expect(result.primaryDashboard.isEmpty).toBe(true);
  });

  it("rejects duplicate restore attempts", async () => {
    await bootstrapHydratedRuntime();

    const deps = {
      unifiedWorkspaceService: createTestUnifiedWorkspaceServiceForDashboard(),
      dashboardProjector: createDashboardProjector({
        unifiedWorkspaceService: createTestUnifiedWorkspaceServiceForDashboard(),
      }),
      athleteIdentityService: createAthleteIdentityService(),
    };

    DashboardRestorePipeline.restore({ deps });

    expect(() => DashboardRestorePipeline.restore({ deps })).toThrow(
      DashboardRestoreError,
    );
    expect(() => DashboardRestorePipeline.restore({ deps })).toThrow(
      /already started/i,
    );
  });

  it("requires repository hydration before restore", () => {
    RuntimeBootstrap.bootstrap();

    expect(() =>
      DashboardRestorePipeline.restore({
        deps: {
          unifiedWorkspaceService: createTestUnifiedWorkspaceServiceForDashboard(),
          dashboardProjector: createDashboardProjector({
            unifiedWorkspaceService: createTestUnifiedWorkspaceServiceForDashboard(),
          }),
          athleteIdentityService: createAthleteIdentityService(),
        },
      }),
    ).toThrow(/hydration must complete/i);
  });

  it("applies restored dashboard to the Home dashboard ViewModel", async () => {
    await bootstrapHydratedRuntime();

    const viewModel = new HomeDashboardViewModel({
      identity: {
        displayName: "Alex",
        initials: "AR",
      },
    });

    DashboardRestorePipeline.restore({
      deps: {
        unifiedWorkspaceService: createTestUnifiedWorkspaceServiceForDashboard(),
        dashboardProjector: createDashboardProjector({
          unifiedWorkspaceService: createTestUnifiedWorkspaceServiceForDashboard(),
        }),
        athleteIdentityService: createAthleteIdentityService(),
        homeDashboardViewModel: viewModel,
      },
    });

    expect(viewModel.isEmpty).toBe(true);
    expect(viewModel.dashboard).not.toBeNull();
  });

  it("exposes restoreDashboard as an idempotent application API", async () => {
    await bootstrapHydratedRuntime();

    const first = await restoreDashboard();
    const second = await restoreDashboard();

    expect(second).toBe(first);
    expect(getDashboardRestoreStatus()).toBe(DASHBOARD_RESTORE_STATUS.ready);
  });
});

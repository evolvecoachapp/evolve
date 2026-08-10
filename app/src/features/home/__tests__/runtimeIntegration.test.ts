import { act, renderHook, waitFor } from "@testing-library/react-native";
import { resetCompositionRoot } from "../../../core/composition/createCompositionRoot";
import { createEmptyHomeDashboard } from "../../../runtime/dashboard-restore/DashboardRestoreRestoration";
import { createDashboardRestoreResult } from "../../../runtime/dashboard-restore/DashboardRestoreResult";
import { DASHBOARD_RESTORE_PHASES } from "../../../runtime/dashboard-restore/DashboardRestoreInitialization";
import {
  createDashboardRestoreState,
} from "../../../runtime/dashboard-restore/DashboardRestoreState";
import {
  setDashboardRestoreStateHolder,
} from "../../../runtime/dashboard-restore/DashboardRestoreStateHolder";
import { DASHBOARD_RESTORE_STATUS } from "../../../runtime/dashboard-restore/DashboardRestoreStatus";
import {
  resetDashboardRestore,
} from "../../../runtime/dashboard-restore/DashboardRestorePipeline";
import { resetRepositoryHydration } from "../../../runtime/hydration/RepositoryHydrationPipeline";
import { resetRuntimeBootstrap } from "../../../runtime/bootstrap/RuntimeBootstrap";
import { RUNTIME_SESSION_STATUS } from "../../../runtime/session/RuntimeSessionStatus";
import { useRuntimeSession } from "../../../runtime/session/RuntimeSessionContext";
import {
  composeTestWorkspaceForAthlete,
  createTestUnifiedWorkspaceServiceForDashboard,
  FIXED_DASHBOARD_ATHLETE_ID,
  FIXED_DASHBOARD_PROJECTED_AT,
} from "../../../integrations/dashboard-projection/testSupport/fixtures";
import { RuntimeBootstrap } from "../../../runtime/bootstrap/RuntimeBootstrap";
import { RepositoryHydrationPipeline } from "../../../runtime/hydration/RepositoryHydrationPipeline";
import { createDashboardProjector } from "../../../integrations/dashboard-projection/projector/DashboardProjector";
import { DashboardRestorePipeline } from "../../../runtime/dashboard-restore/DashboardRestorePipeline";
import {
  createMockIdentityRepository,
  createMockRuntimeRepository,
  createMockSnapshotRepository,
  createMockTimelineRepository,
  createMockWorkspaceRepository,
  createPayloadRecord,
  createRecord,
} from "../../../runtime/dashboard-restore/testSupport/mockRepositories";
import {
  createMockNutritionRepository,
  createMockRecoveryRepository,
  createMockWorkoutRepository,
} from "../../../runtime/write-through/testSupport/mockDomainRepositories";
import { createTestRuntimeServices } from "../../../runtime/testSupport/runtimePersistenceFixtures";
import { mockHomeService } from "../providers/MockHomeService";
import { useHomeDashboard } from "../hooks/useHomeDashboard";
import { HomeDashboardViewModel } from "../viewmodels/HomeDashboardViewModel";
import { HomeLoadingStatuses } from "../models";

jest.mock("../../../runtime/session/RuntimeSessionContext", () => ({
  useRuntimeSession: jest.fn(),
}));

const mockedUseRuntimeSession = useRuntimeSession as jest.Mock;

const identity = Object.freeze({
  displayName: "Alex Rivera",
  initials: "AR",
});

function mockRuntimeReady(): void {
  mockedUseRuntimeSession.mockReturnValue({
    isStarting: false,
    status: RUNTIME_SESSION_STATUS.ready,
    retrySession: jest.fn(),
  });
}

function mockRuntimeStarting(): void {
  mockedUseRuntimeSession.mockReturnValue({
    isStarting: true,
    status: RUNTIME_SESSION_STATUS.starting,
    retrySession: jest.fn(),
  });
}

async function bootstrapPopulatedRuntimeRestore(): Promise<void> {
  RuntimeBootstrap.bootstrap({
    clock: () => FIXED_DASHBOARD_PROJECTED_AT,
  });

  const athleteId = FIXED_DASHBOARD_ATHLETE_ID;
  const services = createTestRuntimeServices(() => FIXED_DASHBOARD_PROJECTED_AT);
  const unifiedWorkspaceService = createTestUnifiedWorkspaceServiceForDashboard({
    clock: () => FIXED_DASHBOARD_PROJECTED_AT,
  });

  services.athleteIdentityService.build({
    athleteId,
    requestId: `home:identity:${athleteId}`,
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
    requestId: "home:runtime:1",
    device: {
      deviceId: "runtime:1",
      model: "Home Device",
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
    requestId: `home:workspace:${athleteId}`,
  });
  composeTestWorkspaceForAthlete(unifiedWorkspaceService, athleteId);

  const identityRecord = services.athleteIdentityService.getAthleteIdentity(athleteId);
  const runtime = services.runtimeEnvironmentService.getRuntimeEnvironment();
  const workspace = unifiedWorkspaceService.getWorkspace(athleteId);

  await RepositoryHydrationPipeline.hydrate({
    deps: {
      identityRepository: createMockIdentityRepository(
        identityRecord
          ? Object.freeze([createPayloadRecord(identityRecord.athleteId, identityRecord)])
          : Object.freeze([createRecord(athleteId)]),
      ),
      runtimeRepository: createMockRuntimeRepository(
        runtime
          ? Object.freeze([createPayloadRecord(runtime.id, runtime)])
          : Object.freeze([createRecord("runtime:1")]),
      ),
      workspaceRepository: createMockWorkspaceRepository(
        workspace
          ? Object.freeze([createPayloadRecord(workspace.athleteId, workspace)])
          : Object.freeze([createRecord(athleteId)]),
      ),
      snapshotRepository: createMockSnapshotRepository(),
      timelineRepository: createMockTimelineRepository(),
      workoutRepository: createMockWorkoutRepository(),
      nutritionRepository: createMockNutritionRepository(),
      recoveryRepository: createMockRecoveryRepository(),
      athleteIdentityService: services.athleteIdentityService,
      runtimeEnvironmentService: services.runtimeEnvironmentService,
      unifiedWorkspaceService,
      athleteSnapshotService: services.athleteSnapshotService,
      coachTimelineService: services.coachTimelineService,
      workoutRuntimePersistenceService: services.workoutRuntimePersistenceService,
      nutritionRuntimePersistenceService: services.nutritionRuntimePersistenceService,
      recoveryRuntimePersistenceService: services.recoveryRuntimePersistenceService,
      clock: () => FIXED_DASHBOARD_PROJECTED_AT,
    },
  });

  const dashboardProjector = createDashboardProjector({
    unifiedWorkspaceService,
    clock: () => FIXED_DASHBOARD_PROJECTED_AT,
  });

  DashboardRestorePipeline.restore({
    athleteIds: [athleteId],
    deps: {
      unifiedWorkspaceService,
      dashboardProjector,
      athleteIdentityService: services.athleteIdentityService,
      clock: () => FIXED_DASHBOARD_PROJECTED_AT,
    },
  });
}

function seedEmptyRestoreState(): void {
  const primaryDashboard = createEmptyHomeDashboard();
  setDashboardRestoreStateHolder(
    createDashboardRestoreState({
      status: DASHBOARD_RESTORE_STATUS.ready,
      result: createDashboardRestoreResult({
        athleteCount: 0,
        projectedCount: 0,
        emptyCount: 1,
        restoredAt: FIXED_DASHBOARD_PROJECTED_AT,
        phases: DASHBOARD_RESTORE_PHASES,
        primaryDashboard,
      }),
      startedAt: FIXED_DASHBOARD_PROJECTED_AT,
      completedAt: FIXED_DASHBOARD_PROJECTED_AT,
    }),
  );
}

describe("Home runtime integration", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    resetDashboardRestore();
    resetRepositoryHydration();
    resetRuntimeBootstrap();
    resetCompositionRoot();
    mockRuntimeReady();
  });

  afterEach(() => {
    resetDashboardRestore();
    resetRepositoryHydration();
    resetRuntimeBootstrap();
    resetCompositionRoot();
  });

  it("useHomeDashboard applies restored dashboard after runtime session is ready", async () => {
    await bootstrapPopulatedRuntimeRestore();
    const getDashboardSpy = jest.spyOn(mockHomeService, "getDashboard");

    const { result } = renderHook(() => useHomeDashboard({ identity }));

    await waitFor(() => {
      expect(result.current.loading.isLoading).toBe(false);
    });

    expect(getDashboardSpy).not.toHaveBeenCalled();
    expect(result.current.error).toBeNull();
    expect(result.current.dashboard?.athlete.displayName).toBe("Alex Rivera");
    expect(result.current.isEmpty).toBe(false);
  });

  it("useHomeDashboard renders empty dashboard when restore produced no cards", async () => {
    RuntimeBootstrap.bootstrap();
    seedEmptyRestoreState();

    const { result } = renderHook(() => useHomeDashboard({ identity }));

    await waitFor(() => {
      expect(result.current.loading.isLoading).toBe(false);
    });

    expect(result.current.isEmpty).toBe(true);
    expect(result.current.dashboard).not.toBeNull();
  });

  it("useHomeDashboard waits for runtime session before applying restore output", async () => {
    await bootstrapPopulatedRuntimeRestore();
    mockRuntimeStarting();

    const { result, rerender } = renderHook(() => useHomeDashboard({ identity }));

    expect(result.current.dashboard).toBeNull();
    expect(result.current.loading.isLoading).toBe(true);

    mockRuntimeReady();
    rerender({});

    await waitFor(() => {
      expect(result.current.dashboard?.athlete.displayName).toBe("Alex Rivera");
    });
  });

  it("useHomeDashboard.refresh re-applies restored dashboard on restart rendering", async () => {
    await bootstrapPopulatedRuntimeRestore();

    const { result } = renderHook(() => useHomeDashboard({ identity }));

    await waitFor(() => {
      expect(result.current.dashboard?.athlete.displayName).toBe("Alex Rivera");
    });

    await act(async () => {
      await result.current.refresh();
    });

    expect(result.current.loading.isRefreshing).toBe(false);
    expect(result.current.dashboard?.athlete.displayName).toBe("Alex Rivera");
    expect(result.current.error).toBeNull();
  });

  it("HomeDashboardViewModel.applyRestoredDashboard is the production data entry point", () => {
    const viewModel = new HomeDashboardViewModel({ identity });
    const dashboard = createEmptyHomeDashboard();

    viewModel.applyRestoredDashboard(dashboard);

    expect(viewModel.isRuntimeDriven).toBe(true);
    expect(viewModel.dashboard).toBe(dashboard);
    expect(viewModel.loading.status).toBe(HomeLoadingStatuses.IDLE);
    expect(viewModel.isEmpty).toBe(true);
  });

  it("HomeDashboardViewModel does not call HomeService when runtime-driven", async () => {
    const viewModel = new HomeDashboardViewModel({ identity });
    const getDashboardSpy = jest.spyOn(mockHomeService, "getDashboard");

    await viewModel.load();
    await viewModel.refresh();

    expect(getDashboardSpy).not.toHaveBeenCalled();
    expect(viewModel.isRuntimeDriven).toBe(true);
  });
});

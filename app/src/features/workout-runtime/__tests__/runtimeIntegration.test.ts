import { act, renderHook, waitFor } from "@testing-library/react-native";
import {
  getCompositionRoot,
  resetCompositionRoot,
} from "../../../core/composition/createCompositionRoot";
import { loadWorkoutHistory } from "../../../features/progress-analytics/application/LoadWorkoutHistory";
import {
  mockProgressAnalyticsService,
  resetMockProgressAnalyticsData,
} from "../../../features/progress-analytics/providers/MockProgressAnalyticsService";
import { createStubPlanHistory } from "../../../features/home-experience/testSupport/fixtures";
import { CoachTimelineEventCategories } from "../../../features/coach-timeline/models/CoachTimelineEvent";
import { appendSeedEntry } from "../../../features/proactive-insights/testSupport/fixtures";
import {
  composeTestWorkspaceForAthlete,
  FIXED_DASHBOARD_ATHLETE_ID,
  FIXED_DASHBOARD_PROJECTED_AT,
} from "../../../integrations/dashboard-projection/testSupport/fixtures";
import {
  createStubAthleteSnapshot,
  createStubAthleteState,
  createStubCoachingSession,
  createStubGoalProgress,
  createStubWorkoutPlan,
} from "../../../features/unified-workspace/testSupport/fixtures";
import { createWorkoutAssemblyRequest } from "../../../features/workout-assembly/testSupport/fixtures";
import { resetNativeSQLiteTestState } from "../../../infrastructure/sqlite/testSupport/resetNativeSQLiteTestState";
import { resetRuntimeBootstrap } from "../../../runtime/bootstrap/RuntimeBootstrap";
import { resetRepositoryHydration } from "../../../runtime/hydration/RepositoryHydrationPipeline";
import { resetDashboardRestore } from "../../../runtime/dashboard-restore/DashboardRestorePipeline";
import { resetRuntimeWriteThrough } from "../../../runtime/write-through/RuntimeWriteThroughPipeline";
import { resetRuntimeSession } from "../../../runtime/session/RuntimeSessionOrchestrator";
import { resetRuntimeObserver } from "../../../runtime/runtime-observer/RuntimeObserver";
import { RUNTIME_SESSION_STATUS } from "../../../runtime/session/RuntimeSessionStatus";
import { useRuntimeSession } from "../../../runtime/session/RuntimeSessionContext";
import { mockWorkoutRuntimeService } from "../providers/MockWorkoutRuntimeService";
import { useWorkoutRuntime } from "../hooks/useWorkoutRuntime";
import { loadHydratedWorkoutRuntime } from "../application/loadHydratedWorkoutRuntime";
import { WorkoutRuntimeViewModel } from "../viewmodels/WorkoutRuntimeViewModel";
import { WorkoutLoadingStatuses } from "../models/experience/WorkoutLoadingState";
import { WorkoutRuntimeStatuses } from "../models/experience/WorkoutRuntimeState";

jest.mock("../../../runtime/session/RuntimeSessionContext", () => ({
  useRuntimeSession: jest.fn(),
}));

const mockedUseRuntimeSession = useRuntimeSession as jest.Mock;

const ATHLETE_ID = FIXED_DASHBOARD_ATHLETE_ID;
const PLAN_ID = "workout-plan:runtime";

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

async function seedPopulatedHydratedWorkout(
  athleteId: string = ATHLETE_ID,
): Promise<void> {
  const root = getCompositionRoot();
  const homeService = root.resolve("HomeExperienceService");
  const unifiedService = root.resolve("UnifiedWorkspaceService");
  const assemblyService = root.resolve("WorkoutAssemblyService");
  const coachTimeline = root.resolve("CoachTimelineService");

  appendSeedEntry(coachTimeline, {
    id: `decision:${athleteId}`,
    category: CoachTimelineEventCategories.COACH_DECISION,
    summary: "Hold intensity",
    affectedDomain: "decision",
  });

  await assemblyService.assembleWorkout(await createWorkoutAssemblyRequest());

  const homeResult = homeService.build({
    athleteId,
    requestId: `workout:home:${athleteId}`,
    workoutPlan: createStubWorkoutPlan({
      id: PLAN_ID,
      name: "Strength Block",
      weekNumber: 3,
    }),
    planHistory: createStubPlanHistory(),
    goalProgress: createStubGoalProgress(),
    coachingSession: createStubCoachingSession(),
  });

  if (!homeResult.success || !homeResult.experience) {
    throw new Error("Failed to seed home experience for workout runtime test.");
  }

  const workspaceResult = unifiedService.build({
    athleteId,
    requestId: `workout:workspace:${athleteId}`,
    generatedAt: FIXED_DASHBOARD_PROJECTED_AT,
    homeExperience: homeResult.experience,
    timeline: coachTimeline.getTimeline(athleteId),
    athleteState: createStubAthleteState({ athleteId }),
    goalProgress: createStubGoalProgress(),
    coachingSession: createStubCoachingSession(),
    snapshot: createStubAthleteSnapshot({ athleteId }),
    insights: Object.freeze([]),
  });

  if (!workspaceResult.success) {
    throw new Error(
      `Failed to seed workspace for workout runtime test: ${workspaceResult.message ?? "unknown error"}`,
    );
  }
}

function seedEmptyHydratedWorkout(athleteId: string = ATHLETE_ID): void {
  const unifiedService = getCompositionRoot().resolve("UnifiedWorkspaceService");
  composeTestWorkspaceForAthlete(unifiedService, athleteId);
}

describe("Workout runtime integration", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    resetMockProgressAnalyticsData();
    resetCompositionRoot();
    mockRuntimeReady();
  });

  afterEach(() => {
    resetCompositionRoot();
  });

  it("useWorkoutRuntime applies hydrated workspace output after runtime session is ready", async () => {
    await seedPopulatedHydratedWorkout();
    const getRuntimeSpy = jest.spyOn(mockWorkoutRuntimeService, "getRuntime");

    const { result } = renderHook(() => useWorkoutRuntime({ athleteId: ATHLETE_ID }));

    await waitFor(() => {
      expect(result.current.loading.isLoading).toBe(false);
    });

    expect(getRuntimeSpy).not.toHaveBeenCalled();
    expect(result.current.error).toBeNull();
    expect(result.current.runtime?.title).toBe("Strength Block");
    expect(result.current.runtime?.exercises.length).toBeGreaterThan(0);
    expect(result.current.isEmpty).toBe(false);
  });

  it("useWorkoutRuntime renders empty workout state when workspace has no active plan", async () => {
    seedEmptyHydratedWorkout();

    const { result } = renderHook(() => useWorkoutRuntime({ athleteId: ATHLETE_ID }));

    await waitFor(() => {
      expect(result.current.loading.isLoading).toBe(false);
    });

    expect(result.current.isEmpty).toBe(true);
    expect(result.current.runtime?.state.status).toBe(WorkoutRuntimeStatuses.EMPTY);
  });

  it("useWorkoutRuntime waits for runtime session before applying hydrated workout", async () => {
    await seedPopulatedHydratedWorkout();
    mockRuntimeStarting();

    const { result, rerender } = renderHook(() =>
      useWorkoutRuntime({ athleteId: ATHLETE_ID }),
    );

    expect(result.current.runtime).toBeNull();
    expect(result.current.loading.isLoading).toBe(true);

    mockRuntimeReady();
    rerender({});

    await waitFor(() => {
      expect(result.current.runtime?.title).toBe("Strength Block");
    });
  });

  it("useWorkoutRuntime.refresh re-applies hydrated workout on restart rendering", async () => {
    await seedPopulatedHydratedWorkout();

    const { result } = renderHook(() => useWorkoutRuntime({ athleteId: ATHLETE_ID }));

    await waitFor(() => {
      expect(result.current.runtime?.title).toBe("Strength Block");
    });

    await act(async () => {
      await result.current.refresh();
    });

    expect(result.current.loading.isRefreshing).toBe(false);
    expect(result.current.runtime?.title).toBe("Strength Block");
    expect(result.current.error).toBeNull();
  });

  it("useWorkoutRuntime surfaces unavailable workout when hydration produced no workspace", async () => {
    const { result } = renderHook(() => useWorkoutRuntime({ athleteId: ATHLETE_ID }));

    await waitFor(() => {
      expect(result.current.loading.isLoading).toBe(false);
    });

    expect(result.current.runtime).toBeNull();
    expect(result.current.error?.code).toBe("workout_runtime_unavailable");
  });

  it("WorkoutRuntimeViewModel.applyHydratedWorkout is the production data entry point", async () => {
    await seedPopulatedHydratedWorkout();
    const runtime = await loadHydratedWorkoutRuntime({ athleteId: ATHLETE_ID });
    const viewModel = new WorkoutRuntimeViewModel({ athleteId: ATHLETE_ID });

    viewModel.applyHydratedWorkout(runtime!);

    expect(viewModel.isRuntimeDriven).toBe(true);
    expect(viewModel.runtime?.title).toBe("Strength Block");
    expect(viewModel.loading.status).toBe(WorkoutLoadingStatuses.IDLE);
  });

  it("WorkoutRuntimeViewModel does not call WorkoutRuntimeExperienceService when runtime-driven", async () => {
    const viewModel = new WorkoutRuntimeViewModel({ athleteId: ATHLETE_ID });
    const getRuntimeSpy = jest.spyOn(mockWorkoutRuntimeService, "getRuntime");

    await viewModel.loadWorkout();
    await viewModel.refresh();

    expect(getRuntimeSpy).not.toHaveBeenCalled();
    expect(viewModel.isRuntimeDriven).toBe(true);
  });

  it("runtime finish publishes WorkoutCompleted through existing progress integration", async () => {
    await seedPopulatedHydratedWorkout();
    resetMockProgressAnalyticsData();

    const baselineHistory = await loadWorkoutHistory({
      service: mockProgressAnalyticsService,
    });

    const viewModel = new WorkoutRuntimeViewModel({
      athleteId: ATHLETE_ID,
      now: () => new Date(FIXED_DASHBOARD_PROJECTED_AT),
    });
    viewModel.applyHydratedWorkout(
      (await loadHydratedWorkoutRuntime({ athleteId: ATHLETE_ID }))!,
    );

    viewModel.completeSet();
    await viewModel.finishWorkout();

    const history = await loadWorkoutHistory({
      service: mockProgressAnalyticsService,
    });

    expect(viewModel.runtime?.state.status).toBe(WorkoutRuntimeStatuses.COMPLETED);
    expect(history.totalCount).toBe(baselineHistory.totalCount + 1);
  });

  it("hydrated workout path does not import SQLite or repository adapters directly", () => {
    const loadModule = require("../application/loadHydratedWorkoutRuntime");
    const viewModelModule = require("../viewmodels/WorkoutRuntimeViewModel");
    const publishModule = require("../application/publishWorkoutRuntimeCompletion");

    for (const source of [
      loadModule.loadHydratedWorkoutRuntime.toString(),
      viewModelModule.WorkoutRuntimeViewModel.toString(),
      publishModule.publishWorkoutRuntimeCompletion.toString(),
    ]) {
      expect(source).not.toMatch(/sqlite/i);
      expect(source).not.toMatch(/WorkoutRepository/);
      expect(source).not.toMatch(/RepositoryAdapter/);
    }
  });
});

describe("Workout runtime restart hydration", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    resetAllRuntimeState();
    mockRuntimeReady();
  });

  afterEach(() => {
    resetAllRuntimeState();
  });

  it("restores populated workout after workspace rehydration", async () => {
    resetCompositionRoot();
    await seedPopulatedHydratedWorkout();

    const first = await loadHydratedWorkoutRuntime({ athleteId: ATHLETE_ID });
    expect(first?.title).toBe("Strength Block");

    resetRuntimePipelinesPreservingCompositionRoot();
    resetCompositionRoot();
    await seedPopulatedHydratedWorkout();

    const restored = await loadHydratedWorkoutRuntime({ athleteId: ATHLETE_ID });
    expect(restored?.title).toBe("Strength Block");
    expect(restored?.exercises.length).toBeGreaterThan(0);
  });
});

import { act, renderHook, waitFor } from "@testing-library/react-native";
import {
  getCompositionRoot,
  resetCompositionRoot,
} from "../../../core/composition/createCompositionRoot";
import {
  getIngestedGoalProgressEvents,
  mockProgressAnalyticsService,
  resetMockProgressAnalyticsData,
} from "../../../features/progress-analytics/providers/MockProgressAnalyticsService";
import { CoachTimelineEventCategories } from "../../../features/coach-timeline/models/CoachTimelineEvent";
import { appendSeedEntry } from "../../../features/proactive-insights/testSupport/fixtures";
import {
  FIXED_DASHBOARD_ATHLETE_ID,
  FIXED_DASHBOARD_PROJECTED_AT,
} from "../../../integrations/dashboard-projection/testSupport/fixtures";
import {
  createStubAthleteSnapshot,
  createStubAthleteState,
  createStubCoachingSession,
  createStubGoalProgress,
} from "../../../features/unified-workspace/testSupport/fixtures";
import {
  createStubPlanHistory,
  createStubRecoveryMetrics,
  createStubSleepProfile,
  createStubWorkoutPlan,
} from "../../../features/home-experience/testSupport/fixtures";
import { resetNativeSQLiteTestState } from "../../../infrastructure/sqlite/testSupport/resetNativeSQLiteTestState";
import { resetRuntimeBootstrap } from "../../../runtime/bootstrap/RuntimeBootstrap";
import { resetRepositoryHydration } from "../../../runtime/hydration/RepositoryHydrationPipeline";
import { resetDashboardRestore } from "../../../runtime/dashboard-restore/DashboardRestorePipeline";
import { resetRuntimeWriteThrough } from "../../../runtime/write-through/RuntimeWriteThroughPipeline";
import { resetRuntimeSession } from "../../../runtime/session/RuntimeSessionOrchestrator";
import { resetRuntimeObserver } from "../../../runtime/runtime-observer/RuntimeObserver";
import { RUNTIME_SESSION_STATUS } from "../../../runtime/session/RuntimeSessionStatus";
import { useRuntimeSession } from "../../../runtime/session/RuntimeSessionContext";
import { mockGoalProgressExperienceService } from "../providers/MockGoalProgressExperienceService";
import { useGoalProgressDashboard } from "../hooks/useGoalProgressDashboard";
import { loadHydratedGoalProgressExperience } from "../application/loadHydratedGoalProgressExperience";
import { GoalProgressExperienceViewModel } from "../viewmodels/GoalProgressExperienceViewModel";
import { GoalProgressLoadingStatuses } from "../models/GoalProgressLoadingState";

jest.mock("../../../runtime/session/RuntimeSessionContext", () => ({
  useRuntimeSession: jest.fn(),
}));

const mockedUseRuntimeSession = useRuntimeSession as jest.Mock;

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

async function seedPopulatedHydratedGoals(athleteId: string = ATHLETE_ID): Promise<void> {
  const root = getCompositionRoot();
  const homeService = root.resolve("HomeExperienceService");
  const unifiedService = root.resolve("UnifiedWorkspaceService");
  const coachTimeline = root.resolve("CoachTimelineService");

  appendSeedEntry(coachTimeline, {
    id: `decision:${athleteId}`,
    category: CoachTimelineEventCategories.COACH_DECISION,
    summary: "Hold intensity",
    affectedDomain: "decision",
  });

  const homeResult = homeService.build({
    athleteId,
    requestId: `goals:home:${athleteId}`,
    recoveryMetrics: createStubRecoveryMetrics(),
    sleepProfile: createStubSleepProfile(),
    goalProgress: createStubGoalProgress(),
    coachingSession: createStubCoachingSession(),
    planHistory: createStubPlanHistory(),
    workoutPlan: createStubWorkoutPlan(),
  });

  if (!homeResult.success || !homeResult.experience) {
    throw new Error("Failed to seed home experience for goal progress runtime test.");
  }

  const workspaceResult = unifiedService.build({
    athleteId,
    requestId: `goals:workspace:${athleteId}`,
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
      `Failed to seed workspace for goal progress runtime test: ${workspaceResult.message ?? "unknown error"}`,
    );
  }
}

function seedEmptyHydratedGoals(athleteId: string = ATHLETE_ID): void {
  const root = getCompositionRoot();
  const homeService = root.resolve("HomeExperienceService");
  const unifiedService = root.resolve("UnifiedWorkspaceService");
  const coachTimeline = root.resolve("CoachTimelineService");

  appendSeedEntry(coachTimeline, {
    id: `decision:${athleteId}`,
    category: CoachTimelineEventCategories.COACH_DECISION,
    summary: "Hold intensity",
    affectedDomain: "decision",
  });

  const homeResult = homeService.build({
    athleteId,
    requestId: `goals:empty:home:${athleteId}`,
    goalProgress: null,
    coachingSession: createStubCoachingSession(),
  });

  if (!homeResult.success || !homeResult.experience) {
    throw new Error("Failed to seed empty home experience for goal progress runtime test.");
  }

  const workspaceResult = unifiedService.build({
    athleteId,
    requestId: `goals:empty:workspace:${athleteId}`,
    generatedAt: FIXED_DASHBOARD_PROJECTED_AT,
    homeExperience: homeResult.experience,
    timeline: coachTimeline.getTimeline(athleteId),
    athleteState: createStubAthleteState({ athleteId }),
    goalProgress: null,
    coachingSession: createStubCoachingSession(),
    snapshot: createStubAthleteSnapshot({ athleteId }),
    insights: Object.freeze([]),
  });

  if (!workspaceResult.success) {
    throw new Error(
      `Failed to seed empty workspace for goal progress runtime test: ${workspaceResult.message ?? "unknown error"}`,
    );
  }
}

describe("Goal Progress runtime integration", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    resetMockProgressAnalyticsData();
    resetCompositionRoot();
    mockRuntimeReady();
  });

  afterEach(() => {
    resetCompositionRoot();
  });

  it("useGoalProgressDashboard applies hydrated workspace output after runtime session is ready", async () => {
    await seedPopulatedHydratedGoals();
    const getDashboardSpy = jest.spyOn(mockGoalProgressExperienceService, "getDashboard");

    const { result } = renderHook(() =>
      useGoalProgressDashboard({ athleteId: ATHLETE_ID }),
    );

    await waitFor(() => {
      expect(result.current.loading.isLoading).toBe(false);
    });

    expect(getDashboardSpy).not.toHaveBeenCalled();
    expect(result.current.error).toBeNull();
    expect(result.current.dashboard?.goalId).toBeTruthy();
    expect(result.current.isEmpty).toBe(false);
  });

  it("useGoalProgressDashboard renders empty goal state when workspace has no goals", async () => {
    seedEmptyHydratedGoals();

    const { result } = renderHook(() =>
      useGoalProgressDashboard({ athleteId: ATHLETE_ID }),
    );

    await waitFor(() => {
      expect(result.current.loading.isLoading).toBe(false);
    });

    expect(result.current.isEmpty).toBe(true);
    expect(result.current.dashboard?.goalId).toBeNull();
  });

  it("useGoalProgressDashboard waits for runtime session before applying hydrated goals", async () => {
    await seedPopulatedHydratedGoals();
    mockRuntimeStarting();

    const { result, rerender } = renderHook(() =>
      useGoalProgressDashboard({ athleteId: ATHLETE_ID }),
    );

    expect(result.current.dashboard).toBeNull();
    expect(result.current.loading.isLoading).toBe(true);

    mockRuntimeReady();
    rerender({});

    await waitFor(() => {
      expect(result.current.dashboard?.goalId).toBeTruthy();
    });
  });

  it("useGoalProgressDashboard.refresh re-applies hydrated goals on restart rendering", async () => {
    await seedPopulatedHydratedGoals();

    const { result } = renderHook(() =>
      useGoalProgressDashboard({ athleteId: ATHLETE_ID }),
    );

    await waitFor(() => {
      expect(result.current.dashboard?.goalId).toBeTruthy();
    });

    await act(async () => {
      await result.current.refresh();
    });

    expect(result.current.loading.isRefreshing).toBe(false);
    expect(result.current.dashboard?.goalId).toBeTruthy();
    expect(result.current.error).toBeNull();
  });

  it("useGoalProgressDashboard surfaces unavailable goal progress when hydration produced no workspace", async () => {
    const { result } = renderHook(() =>
      useGoalProgressDashboard({ athleteId: ATHLETE_ID }),
    );

    await waitFor(() => {
      expect(result.current.loading.isLoading).toBe(false);
    });

    expect(result.current.dashboard).toBeNull();
    expect(result.current.error?.code).toBe("goal_progress_runtime_unavailable");
  });

  it("GoalProgressExperienceViewModel.applyHydratedGoalProgress is the production data entry point", async () => {
    await seedPopulatedHydratedGoals();
    const dashboard = await loadHydratedGoalProgressExperience({ athleteId: ATHLETE_ID });
    const viewModel = new GoalProgressExperienceViewModel({ athleteId: ATHLETE_ID });

    viewModel.applyHydratedGoalProgress(dashboard!);

    expect(viewModel.isRuntimeDriven).toBe(true);
    expect(viewModel.dashboard?.goalId).toBeTruthy();
    expect(viewModel.loading.status).toBe(GoalProgressLoadingStatuses.IDLE);
  });

  it("GoalProgressExperienceViewModel does not call GoalProgressExperienceService when runtime-driven", async () => {
    const viewModel = new GoalProgressExperienceViewModel({ athleteId: ATHLETE_ID });
    const getDashboardSpy = jest.spyOn(mockGoalProgressExperienceService, "getDashboard");

    await viewModel.loadDashboard();
    await viewModel.refresh();

    expect(getDashboardSpy).not.toHaveBeenCalled();
    expect(viewModel.isRuntimeDriven).toBe(true);
  });

  it("runtime progress update publishes GoalProgressUpdated through existing goal integration", async () => {
    await seedPopulatedHydratedGoals();
    resetMockProgressAnalyticsData();

    const viewModel = new GoalProgressExperienceViewModel({
      athleteId: ATHLETE_ID,
      now: () => new Date(FIXED_DASHBOARD_PROJECTED_AT),
    });
    viewModel.applyHydratedGoalProgress(
      (await loadHydratedGoalProgressExperience({ athleteId: ATHLETE_ID }))!,
    );

    await viewModel.updateProgress();

    expect(
      getIngestedGoalProgressEvents().some(
        (event) => event.eventType === "GoalProgressUpdated",
      ),
    ).toBe(true);
  });

  it("runtime milestone completion publishes GoalMilestoneReached through existing goal integration", async () => {
    await seedPopulatedHydratedGoals();
    resetMockProgressAnalyticsData();

    const viewModel = new GoalProgressExperienceViewModel({
      athleteId: ATHLETE_ID,
      now: () => new Date(FIXED_DASHBOARD_PROJECTED_AT),
    });
    viewModel.applyHydratedGoalProgress(
      (await loadHydratedGoalProgressExperience({ athleteId: ATHLETE_ID }))!,
    );

    const milestoneId = viewModel.dashboard?.milestones[0]?.id;
    expect(milestoneId).toBeTruthy();

    await viewModel.completeMilestone(milestoneId!);

    expect(viewModel.dashboard?.milestones[0]?.reached).toBe(true);
    expect(
      getIngestedGoalProgressEvents().some(
        (event) => event.eventType === "GoalMilestoneReached",
      ),
    ).toBe(true);
  });

  it("runtime goal completion publishes GoalCompleted through existing goal integration", async () => {
    await seedPopulatedHydratedGoals();
    resetMockProgressAnalyticsData();

    const viewModel = new GoalProgressExperienceViewModel({
      athleteId: ATHLETE_ID,
      now: () => new Date(FIXED_DASHBOARD_PROJECTED_AT),
    });
    viewModel.applyHydratedGoalProgress(
      (await loadHydratedGoalProgressExperience({ athleteId: ATHLETE_ID }))!,
    );

    const milestoneId = viewModel.dashboard?.milestones[0]?.id;
    await viewModel.completeMilestone(milestoneId!);
    await viewModel.completeGoal();

    expect(viewModel.dashboard?.isCompleted).toBe(true);
    expect(
      getIngestedGoalProgressEvents().some(
        (event) => event.eventType === "GoalCompleted",
      ),
    ).toBe(true);
  });

  it("hydrated goal progress path does not import SQLite or repository adapters directly", () => {
    const loadModule = require("../application/loadHydratedGoalProgressExperience");
    const viewModelModule = require("../viewmodels/GoalProgressExperienceViewModel");
    const publishModule = require("../application/publishGoalRuntimeProgress");

    for (const source of [
      loadModule.loadHydratedGoalProgressExperience.toString(),
      viewModelModule.GoalProgressExperienceViewModel.toString(),
      publishModule.publishGoalRuntimeProgressUpdated.toString(),
    ]) {
      expect(source).not.toMatch(/sqlite/i);
      expect(source).not.toMatch(/GoalRepository/);
      expect(source).not.toMatch(/RepositoryAdapter/);
    }
  });
});

describe("Goal Progress runtime restart hydration", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    resetAllRuntimeState();
    mockRuntimeReady();
  });

  afterEach(() => {
    resetAllRuntimeState();
  });

  it("restores populated goals after workspace rehydration", async () => {
    resetCompositionRoot();
    await seedPopulatedHydratedGoals();

    const first = await loadHydratedGoalProgressExperience({ athleteId: ATHLETE_ID });
    expect(first?.goalId).toBeTruthy();

    resetRuntimePipelinesPreservingCompositionRoot();
    resetCompositionRoot();
    await seedPopulatedHydratedGoals();

    const restored = await loadHydratedGoalProgressExperience({ athleteId: ATHLETE_ID });
    expect(restored?.goalId).toBeTruthy();
    expect(restored?.milestones.length).toBeGreaterThan(0);
  });
});

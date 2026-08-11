import { act, renderHook, waitFor } from "@testing-library/react-native";
import {
  getCompositionRoot,
  resetCompositionRoot,
} from "../../../core/composition/createCompositionRoot";
import {
  getIngestedRecoveryProgressEvents,
  mockProgressAnalyticsService,
  resetMockProgressAnalyticsData,
} from "../../../features/progress-analytics/providers/MockProgressAnalyticsService";
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
import { mockRecoveryExperienceService } from "../providers/MockRecoveryExperienceService";
import { useRecoveryDashboard } from "../hooks/useRecoveryDashboard";
import { loadHydratedRecoveryExperience } from "../application/loadHydratedRecoveryExperience";
import { RecoveryExperienceViewModel } from "../viewmodels/RecoveryExperienceViewModel";
import { RecoveryLoadingStatuses } from "../models/RecoveryLoadingState";

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

async function seedPopulatedHydratedRecovery(
  athleteId: string = ATHLETE_ID,
): Promise<void> {
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
    requestId: `recovery:home:${athleteId}`,
    recoveryMetrics: createStubRecoveryMetrics(),
    sleepProfile: createStubSleepProfile({ hours: 7.5, label: "good" }),
    recoveryNotes: Object.freeze(["Protect sleep quality today"]),
    planHistory: createStubPlanHistory(),
    goalProgress: createStubGoalProgress(),
    coachingSession: createStubCoachingSession(),
    workoutPlan: createStubWorkoutPlan(),
  });

  if (!homeResult.success || !homeResult.experience) {
    throw new Error("Failed to seed home experience for recovery runtime test.");
  }

  const workspaceResult = unifiedService.build({
    athleteId,
    requestId: `recovery:workspace:${athleteId}`,
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
      `Failed to seed workspace for recovery runtime test: ${workspaceResult.message ?? "unknown error"}`,
    );
  }
}

function seedEmptyHydratedRecovery(athleteId: string = ATHLETE_ID): void {
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
    requestId: `recovery:empty:home:${athleteId}`,
    goalProgress: createStubGoalProgress(),
    coachingSession: createStubCoachingSession(),
  });

  if (!homeResult.success || !homeResult.experience) {
    throw new Error("Failed to seed empty home experience for recovery runtime test.");
  }

  const workspaceResult = unifiedService.build({
    athleteId,
    requestId: `recovery:empty:workspace:${athleteId}`,
    generatedAt: FIXED_DASHBOARD_PROJECTED_AT,
    homeExperience: homeResult.experience,
    timeline: coachTimeline.getTimeline(athleteId),
    athleteState: createStubAthleteState({ athleteId, recoveryStatus: null }),
    goalProgress: createStubGoalProgress(),
    coachingSession: createStubCoachingSession(),
    snapshot: createStubAthleteSnapshot({ athleteId }),
    insights: Object.freeze([]),
  });

  if (!workspaceResult.success) {
    throw new Error(
      `Failed to seed empty workspace for recovery runtime test: ${workspaceResult.message ?? "unknown error"}`,
    );
  }
}

describe("Recovery runtime integration", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    resetMockProgressAnalyticsData();
    resetCompositionRoot();
    mockRuntimeReady();
  });

  afterEach(() => {
    resetCompositionRoot();
  });

  it("useRecoveryDashboard applies hydrated workspace output after runtime session is ready", async () => {
    await seedPopulatedHydratedRecovery();
    const getDashboardSpy = jest.spyOn(mockRecoveryExperienceService, "getDashboard");

    const { result } = renderHook(() =>
      useRecoveryDashboard({ athleteId: ATHLETE_ID }),
    );

    await waitFor(() => {
      expect(result.current.loading.isLoading).toBe(false);
    });

    expect(getDashboardSpy).not.toHaveBeenCalled();
    expect(result.current.error).toBeNull();
    expect(result.current.dashboard?.headline).toContain("recovery");
    expect(result.current.dashboard?.signals.length).toBeGreaterThan(0);
    expect(result.current.isEmpty).toBe(false);
  });

  it("useRecoveryDashboard renders empty recovery state when workspace has no recovery signals", async () => {
    seedEmptyHydratedRecovery();

    const { result } = renderHook(() =>
      useRecoveryDashboard({ athleteId: ATHLETE_ID }),
    );

    await waitFor(() => {
      expect(result.current.loading.isLoading).toBe(false);
    });

    expect(result.current.isEmpty).toBe(true);
    expect(result.current.dashboard?.recoveryScore).toBe(0);
  });

  it("useRecoveryDashboard waits for runtime session before applying hydrated recovery", async () => {
    await seedPopulatedHydratedRecovery();
    mockRuntimeStarting();

    const { result, rerender } = renderHook(() =>
      useRecoveryDashboard({ athleteId: ATHLETE_ID }),
    );

    expect(result.current.dashboard).toBeNull();
    expect(result.current.loading.isLoading).toBe(true);

    mockRuntimeReady();
    rerender({});

    await waitFor(() => {
      expect(result.current.dashboard?.signals.length).toBeGreaterThan(0);
    });
  });

  it("useRecoveryDashboard.refresh re-applies hydrated recovery on restart rendering", async () => {
    await seedPopulatedHydratedRecovery();

    const { result } = renderHook(() =>
      useRecoveryDashboard({ athleteId: ATHLETE_ID }),
    );

    await waitFor(() => {
      expect(result.current.dashboard?.signals.length).toBeGreaterThan(0);
    });

    await act(async () => {
      await result.current.refresh();
    });

    expect(result.current.loading.isRefreshing).toBe(false);
    expect(result.current.dashboard?.signals.length).toBeGreaterThan(0);
    expect(result.current.error).toBeNull();
  });

  it("useRecoveryDashboard surfaces unavailable recovery when hydration produced no workspace", async () => {
    const { result } = renderHook(() =>
      useRecoveryDashboard({ athleteId: ATHLETE_ID }),
    );

    await waitFor(() => {
      expect(result.current.loading.isLoading).toBe(false);
    });

    expect(result.current.dashboard).toBeNull();
    expect(result.current.error?.code).toBe("recovery_runtime_unavailable");
  });

  it("RecoveryExperienceViewModel.applyHydratedRecovery is the production data entry point", async () => {
    await seedPopulatedHydratedRecovery();
    const dashboard = await loadHydratedRecoveryExperience({ athleteId: ATHLETE_ID });
    const viewModel = new RecoveryExperienceViewModel({ athleteId: ATHLETE_ID });

    viewModel.applyHydratedRecovery(dashboard!);

    expect(viewModel.isRuntimeDriven).toBe(true);
    expect(viewModel.dashboard?.signals.length).toBeGreaterThan(0);
    expect(viewModel.loading.status).toBe(RecoveryLoadingStatuses.IDLE);
  });

  it("RecoveryExperienceViewModel does not call RecoveryExperienceService when runtime-driven", async () => {
    const viewModel = new RecoveryExperienceViewModel({ athleteId: ATHLETE_ID });
    const getDashboardSpy = jest.spyOn(mockRecoveryExperienceService, "getDashboard");

    await viewModel.loadDashboard();
    await viewModel.refresh();

    expect(getDashboardSpy).not.toHaveBeenCalled();
    expect(viewModel.isRuntimeDriven).toBe(true);
  });

  it("runtime sleep mutation publishes SleepLogged through existing progress integration", async () => {
    await seedPopulatedHydratedRecovery();
    resetMockProgressAnalyticsData();

    const viewModel = new RecoveryExperienceViewModel({
      athleteId: ATHLETE_ID,
      now: () => new Date(FIXED_DASHBOARD_PROJECTED_AT),
    });
    viewModel.applyHydratedRecovery(
      (await loadHydratedRecoveryExperience({ athleteId: ATHLETE_ID }))!,
    );

    await viewModel.logSleep(7.5);

    expect(viewModel.dashboard?.sleep.hours).toBe(7.5);
    expect(
      getIngestedRecoveryProgressEvents().some(
        (event) => event.eventType === "SleepLogged",
      ),
    ).toBe(true);
  });

  it("runtime readiness mutation publishes ReadinessUpdated through existing progress integration", async () => {
    await seedPopulatedHydratedRecovery();
    resetMockProgressAnalyticsData();

    const viewModel = new RecoveryExperienceViewModel({
      athleteId: ATHLETE_ID,
      now: () => new Date(FIXED_DASHBOARD_PROJECTED_AT),
    });
    viewModel.applyHydratedRecovery(
      (await loadHydratedRecoveryExperience({ athleteId: ATHLETE_ID }))!,
    );

    await viewModel.updateReadiness(78);

    expect(viewModel.dashboard?.readiness.score).toBe(78);
    expect(
      getIngestedRecoveryProgressEvents().some(
        (event) => event.eventType === "ReadinessUpdated",
      ),
    ).toBe(true);
  });

  it("runtime assessment publishes RecoveryAssessed through existing progress integration", async () => {
    await seedPopulatedHydratedRecovery();
    resetMockProgressAnalyticsData();

    const baseline = await mockProgressAnalyticsService.getRecoveryStatistics();

    const viewModel = new RecoveryExperienceViewModel({
      athleteId: ATHLETE_ID,
      now: () => new Date(FIXED_DASHBOARD_PROJECTED_AT),
    });
    viewModel.applyHydratedRecovery(
      (await loadHydratedRecoveryExperience({ athleteId: ATHLETE_ID }))!,
    );

    await viewModel.assessRecovery();

    const stats = await mockProgressAnalyticsService.getRecoveryStatistics();

    expect(viewModel.dashboard?.recoveryScore).toBeGreaterThan(0);
    expect(stats.entries.length).toBeGreaterThan(baseline.entries.length);
    expect(
      getIngestedRecoveryProgressEvents().some(
        (event) => event.eventType === "RecoveryAssessed",
      ),
    ).toBe(true);
  });

  it("changeDay does not carry the previous day's sleep/readiness overlay onto a different day", async () => {
    await seedPopulatedHydratedRecovery();

    const viewModel = new RecoveryExperienceViewModel({
      athleteId: ATHLETE_ID,
      now: () => new Date(FIXED_DASHBOARD_PROJECTED_AT),
    });
    viewModel.applyHydratedRecovery(
      (await loadHydratedRecoveryExperience({ athleteId: ATHLETE_ID }))!,
    );

    const todayIsoDate = viewModel.day.isoDate;
    const baselineSleepHours = viewModel.dashboard?.sleep.hours ?? 0;

    await viewModel.logSleep(9.5);
    expect(viewModel.dashboard?.sleep.hours).toBe(9.5);

    const [yesterday, , tomorrow] = viewModel.availableDays;
    expect(yesterday.isoDate).not.toBe(todayIsoDate);
    expect(tomorrow.isoDate).not.toBe(todayIsoDate);

    await viewModel.changeDay(yesterday);
    expect(viewModel.day.isoDate).toBe(yesterday.isoDate);
    expect(viewModel.dashboard?.sleep.hours).not.toBe(9.5);
    expect(viewModel.dashboard?.sleep.hours).toBe(baselineSleepHours);

    const today = viewModel.availableDays.find(
      (day) => day.isoDate === todayIsoDate,
    )!;
    await viewModel.changeDay(today);
    expect(viewModel.dashboard?.sleep.hours).toBe(9.5);
  });

  it("hydrated recovery path does not import SQLite or repository adapters directly", () => {
    const loadModule = require("../application/loadHydratedRecoveryExperience");
    const viewModelModule = require("../viewmodels/RecoveryExperienceViewModel");
    const publishModule = require("../application/publishRecoveryRuntimeProgress");

    for (const source of [
      loadModule.loadHydratedRecoveryExperience.toString(),
      viewModelModule.RecoveryExperienceViewModel.toString(),
      publishModule.publishRecoveryRuntimeSleepProgress.toString(),
    ]) {
      expect(source).not.toMatch(/sqlite/i);
      expect(source).not.toMatch(/RecoveryRepository/);
      expect(source).not.toMatch(/RepositoryAdapter/);
    }
  });
});

describe("Recovery runtime restart hydration", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    resetAllRuntimeState();
    mockRuntimeReady();
  });

  afterEach(() => {
    resetAllRuntimeState();
  });

  it("restores populated recovery after workspace rehydration", async () => {
    resetCompositionRoot();
    await seedPopulatedHydratedRecovery();

    const first = await loadHydratedRecoveryExperience({ athleteId: ATHLETE_ID });
    expect(first?.signals.length).toBeGreaterThan(0);

    resetRuntimePipelinesPreservingCompositionRoot();
    resetCompositionRoot();
    await seedPopulatedHydratedRecovery();

    const restored = await loadHydratedRecoveryExperience({ athleteId: ATHLETE_ID });
    expect(restored?.signals.length).toBeGreaterThan(0);
    expect(restored?.sleep.hours).toBeGreaterThan(0);
  });
});

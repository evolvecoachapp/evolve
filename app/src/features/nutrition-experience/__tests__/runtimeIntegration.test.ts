import { act, renderHook, waitFor } from "@testing-library/react-native";
import {
  getCompositionRoot,
  resetCompositionRoot,
} from "../../../core/composition/createCompositionRoot";
import {
  getIngestedNutritionProgressEvents,
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
import { createNutritionPlanFixture } from "../../../features/plan-restore/testSupport/fixtures";
import {
  createStubAthleteSnapshot,
  createStubAthleteState,
  createStubCoachingSession,
  createStubGoalProgress,
} from "../../../features/unified-workspace/testSupport/fixtures";
import {
  createStubPlanHistory,
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
import { mockNutritionExperienceService } from "../providers/MockNutritionExperienceService";
import { useNutritionDashboard } from "../hooks/useNutritionDashboard";
import { loadHydratedNutritionExperience } from "../application/loadHydratedNutritionExperience";
import { NutritionExperienceViewModel } from "../viewmodels/NutritionExperienceViewModel";
import { NutritionLoadingStatuses } from "../models/NutritionLoadingState";

jest.mock("../../../runtime/session/RuntimeSessionContext", () => ({
  useRuntimeSession: jest.fn(),
}));

const mockedUseRuntimeSession = useRuntimeSession as jest.Mock;

const ATHLETE_ID = FIXED_DASHBOARD_ATHLETE_ID;
const NUTRITION_PLAN_ID = "nutrition-plan:runtime";
const NUTRITION_LINEAGE_ID = "lineage:nutrition:runtime";

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

function createPopulatedNutritionPlan() {
  return createNutritionPlanFixture({
    id: NUTRITION_PLAN_ID,
    macroTargets: Object.freeze({
      calories: 2400,
      proteinG: 180,
      carbsG: 250,
      fatG: 70,
      fiberG: 30,
    }),
    mealDistribution: Object.freeze({
      mealsPerDay: 3,
      distribution: Object.freeze(["Breakfast", "Lunch", "Dinner"]),
    }),
    hydrationPlan: Object.freeze({
      litersPerDay: 3.2,
      notes: Object.freeze(["Front-load water before training"]),
    }),
  });
}

async function seedPopulatedHydratedNutrition(
  athleteId: string = ATHLETE_ID,
): Promise<void> {
  const root = getCompositionRoot();
  const homeService = root.resolve("HomeExperienceService");
  const unifiedService = root.resolve("UnifiedWorkspaceService");
  const coachTimeline = root.resolve("CoachTimelineService");
  const planHistory = root.resolve("PlanHistoryService");
  const nutritionPlan = createPopulatedNutritionPlan();

  appendSeedEntry(coachTimeline, {
    id: `decision:${athleteId}`,
    category: CoachTimelineEventCategories.COACH_DECISION,
    summary: "Hold intensity",
    affectedDomain: "decision",
  });

  appendSeedEntry(coachTimeline, {
    id: `nutrition:${athleteId}`,
    category: CoachTimelineEventCategories.NUTRITION_MODIFIED,
    summary: "Macros redistributed",
    affectedDomain: "nutrition",
  });

  planHistory.publishVersion({
    id: "publish:nutrition:runtime",
    lineageId: NUTRITION_LINEAGE_ID,
    planType: "nutrition",
    athleteId,
    conversationId: "conversation:1",
    sessionId: "session:1",
    changeReason: "initial",
    changeSummary: "Published nutrition plan",
    workoutPlan: null,
    nutritionPlan,
    createdAt: FIXED_DASHBOARD_PROJECTED_AT,
  });

  const homeResult = homeService.build({
    athleteId,
    requestId: `nutrition:home:${athleteId}`,
    nutritionPlan,
    planHistory: createStubPlanHistory({
      lineageId: NUTRITION_LINEAGE_ID,
      planType: "nutrition",
    }),
    goalProgress: createStubGoalProgress(),
    coachingSession: createStubCoachingSession(),
    workoutPlan: createStubWorkoutPlan(),
    timelineEntries: coachTimeline.getTimeline(athleteId)?.entries,
  });

  if (!homeResult.success || !homeResult.experience) {
    throw new Error("Failed to seed home experience for nutrition runtime test.");
  }

  const workspaceResult = unifiedService.build({
    athleteId,
    requestId: `nutrition:workspace:${athleteId}`,
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
      `Failed to seed workspace for nutrition runtime test: ${workspaceResult.message ?? "unknown error"}`,
    );
  }
}

function seedEmptyHydratedNutrition(athleteId: string = ATHLETE_ID): void {
  const unifiedService = getCompositionRoot().resolve("UnifiedWorkspaceService");
  composeTestWorkspaceForAthlete(unifiedService, athleteId);
}

describe("Nutrition runtime integration", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    resetMockProgressAnalyticsData();
    resetCompositionRoot();
    mockRuntimeReady();
  });

  afterEach(() => {
    resetCompositionRoot();
  });

  it("useNutritionDashboard applies hydrated workspace output after runtime session is ready", async () => {
    await seedPopulatedHydratedNutrition();
    const getDashboardSpy = jest.spyOn(mockNutritionExperienceService, "getDashboard");

    const { result } = renderHook(() =>
      useNutritionDashboard({ athleteId: ATHLETE_ID }),
    );

    await waitFor(() => {
      expect(result.current.loading.isLoading).toBe(false);
    });

    expect(getDashboardSpy).not.toHaveBeenCalled();
    expect(result.current.error).toBeNull();
    expect(result.current.dashboard?.headline).toContain("kcal");
    expect(result.current.dashboard?.meals.length).toBeGreaterThan(0);
    expect(result.current.isEmpty).toBe(false);
  });

  it("useNutritionDashboard renders empty nutrition state when workspace has no active plan", async () => {
    seedEmptyHydratedNutrition();

    const { result } = renderHook(() =>
      useNutritionDashboard({ athleteId: ATHLETE_ID }),
    );

    await waitFor(() => {
      expect(result.current.loading.isLoading).toBe(false);
    });

    expect(result.current.isEmpty).toBe(true);
    expect(result.current.dashboard?.meals.length).toBe(0);
  });

  it("useNutritionDashboard waits for runtime session before applying hydrated nutrition", async () => {
    await seedPopulatedHydratedNutrition();
    mockRuntimeStarting();

    const { result, rerender } = renderHook(() =>
      useNutritionDashboard({ athleteId: ATHLETE_ID }),
    );

    expect(result.current.dashboard).toBeNull();
    expect(result.current.loading.isLoading).toBe(true);

    mockRuntimeReady();
    rerender({});

    await waitFor(() => {
      expect(result.current.dashboard?.meals.length).toBeGreaterThan(0);
    });
  });

  it("useNutritionDashboard.refresh re-applies hydrated nutrition on restart rendering", async () => {
    await seedPopulatedHydratedNutrition();

    const { result } = renderHook(() =>
      useNutritionDashboard({ athleteId: ATHLETE_ID }),
    );

    await waitFor(() => {
      expect(result.current.dashboard?.meals.length).toBeGreaterThan(0);
    });

    await act(async () => {
      await result.current.refresh();
    });

    expect(result.current.loading.isRefreshing).toBe(false);
    expect(result.current.dashboard?.meals.length).toBeGreaterThan(0);
    expect(result.current.error).toBeNull();
  });

  it("useNutritionDashboard surfaces unavailable nutrition when hydration produced no workspace", async () => {
    const { result } = renderHook(() =>
      useNutritionDashboard({ athleteId: ATHLETE_ID }),
    );

    await waitFor(() => {
      expect(result.current.loading.isLoading).toBe(false);
    });

    expect(result.current.dashboard).toBeNull();
    expect(result.current.error?.code).toBe("nutrition_runtime_unavailable");
  });

  it("NutritionExperienceViewModel.applyHydratedDashboard is the production data entry point", async () => {
    await seedPopulatedHydratedNutrition();
    const dashboard = await loadHydratedNutritionExperience({ athleteId: ATHLETE_ID });
    const viewModel = new NutritionExperienceViewModel({ athleteId: ATHLETE_ID });

    viewModel.applyHydratedDashboard(dashboard!);

    expect(viewModel.isRuntimeDriven).toBe(true);
    expect(viewModel.dashboard?.meals.length).toBeGreaterThan(0);
    expect(viewModel.loading.status).toBe(NutritionLoadingStatuses.IDLE);
  });

  it("NutritionExperienceViewModel does not call NutritionExperienceService when runtime-driven", async () => {
    const viewModel = new NutritionExperienceViewModel({ athleteId: ATHLETE_ID });
    const getDashboardSpy = jest.spyOn(mockNutritionExperienceService, "getDashboard");

    await viewModel.loadDashboard();
    await viewModel.refresh();

    expect(getDashboardSpy).not.toHaveBeenCalled();
    expect(viewModel.isRuntimeDriven).toBe(true);
  });

  it("runtime meal toggle publishes MealLogged through existing progress integration", async () => {
    await seedPopulatedHydratedNutrition();
    resetMockProgressAnalyticsData();

    const baseline = await mockProgressAnalyticsService.getNutritionStatistics();

    const viewModel = new NutritionExperienceViewModel({
      athleteId: ATHLETE_ID,
      now: () => new Date(FIXED_DASHBOARD_PROJECTED_AT),
    });
    viewModel.applyHydratedDashboard(
      (await loadHydratedNutritionExperience({ athleteId: ATHLETE_ID }))!,
    );

    const mealId = viewModel.meals[0]?.id;
    expect(mealId).toBeTruthy();

    await viewModel.toggleMealCompletion(mealId!);

    const stats = await mockProgressAnalyticsService.getNutritionStatistics();

    expect(viewModel.meals.find((meal) => meal.id === mealId)?.isCompleted).toBe(true);
    expect(stats.entries.length).toBeGreaterThan(baseline.entries.length);
  });

  it("runtime hydration mutation publishes HydrationLogged through existing progress integration", async () => {
    await seedPopulatedHydratedNutrition();
    resetMockProgressAnalyticsData();

    const viewModel = new NutritionExperienceViewModel({
      athleteId: ATHLETE_ID,
      now: () => new Date(FIXED_DASHBOARD_PROJECTED_AT),
    });
    viewModel.applyHydratedDashboard(
      (await loadHydratedNutritionExperience({ athleteId: ATHLETE_ID }))!,
    );

    await viewModel.logHydration(250);

    expect(viewModel.hydration?.currentMl).toBe(250);
    expect(
      getIngestedNutritionProgressEvents().some(
        (event) => event.eventType === "HydrationLogged",
      ),
    ).toBe(true);
  });

  it("hydrated nutrition path does not import SQLite or repository adapters directly", () => {
    const loadModule = require("../application/loadHydratedNutritionExperience");
    const viewModelModule = require("../viewmodels/NutritionExperienceViewModel");
    const publishModule = require("../application/publishNutritionRuntimeProgress");

    for (const source of [
      loadModule.loadHydratedNutritionExperience.toString(),
      viewModelModule.NutritionExperienceViewModel.toString(),
      publishModule.publishNutritionRuntimeMealProgress.toString(),
    ]) {
      expect(source).not.toMatch(/sqlite/i);
      expect(source).not.toMatch(/NutritionRepository/);
      expect(source).not.toMatch(/RepositoryAdapter/);
    }
  });
});

describe("Nutrition runtime restart hydration", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    resetAllRuntimeState();
    mockRuntimeReady();
  });

  afterEach(() => {
    resetAllRuntimeState();
  });

  it("restores populated nutrition after workspace rehydration", async () => {
    resetCompositionRoot();
    await seedPopulatedHydratedNutrition();

    const first = await loadHydratedNutritionExperience({ athleteId: ATHLETE_ID });
    expect(first?.meals.length).toBeGreaterThan(0);

    resetRuntimePipelinesPreservingCompositionRoot();
    resetCompositionRoot();
    await seedPopulatedHydratedNutrition();

    const restored = await loadHydratedNutritionExperience({ athleteId: ATHLETE_ID });
    expect(restored?.meals.length).toBeGreaterThan(0);
    expect(restored?.macros.calories.target).toBe(2400);
  });
});

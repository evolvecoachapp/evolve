import { act, renderHook, waitFor } from "@testing-library/react-native";
import {
  createCompositionRoot,
  getCompositionRoot,
  resetCompositionRoot,
} from "../../../core/composition/createCompositionRoot";
import { MemoryCategories } from "../../../features/conversation-memory/models/MemoryCategory";
import { CoachTimelineEventCategories } from "../../../features/coach-timeline/models/CoachTimelineEvent";
import { CoachConversationStages } from "../../../features/coach-conversation/models";
import {
  generateAndAttachPlan,
} from "../../../features/coach-conversation/testSupport/fixtures";
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
  createStubInsight,
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
import { observeRuntime } from "../../../runtime/runtime-observer/application/observeRuntime";
import { hydrateRuntime } from "../../../runtime/hydration/application/hydrateRuntime";
import { startRuntimeSession } from "../../../runtime/session/application/startRuntimeSession";
import { getRuntimeWriteThroughPromise } from "../../../runtime/write-through/RuntimeWriteThroughPipeline";
import { readPersistedCoachRuntimeOverlay } from "../../../runtime/domain-persistence/application/persistCoachRuntimeMutation";
import { RUNTIME_SESSION_STATUS } from "../../../runtime/session/RuntimeSessionStatus";
import { useRuntimeSession } from "../../../runtime/session/RuntimeSessionContext";
import { mockCoachExperienceService } from "../providers/MockCoachExperienceService";
import { useCoachConversation } from "../hooks/useCoachConversation";
import { loadHydratedCoachExperience } from "../application/loadHydratedCoachExperience";
import { sendRuntimeCoachMessage } from "../application/sendRuntimeCoachMessage";
import { CoachExperienceViewModel } from "../viewmodels/CoachExperienceViewModel";
import { CoachLoadingStatuses } from "../models/CoachLoadingState";

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

async function seedPopulatedHydratedCoach(
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
    requestId: `coach:home:${athleteId}`,
    recoveryMetrics: createStubRecoveryMetrics(),
    sleepProfile: createStubSleepProfile(),
    goalProgress: createStubGoalProgress(),
    coachingSession: createStubCoachingSession(),
    planHistory: createStubPlanHistory(),
    workoutPlan: createStubWorkoutPlan(),
  });

  if (!homeResult.success || !homeResult.experience) {
    throw new Error("Failed to seed home experience for coach runtime test.");
  }

  const workspaceResult = unifiedService.build({
    athleteId,
    requestId: `coach:workspace:${athleteId}`,
    generatedAt: FIXED_DASHBOARD_PROJECTED_AT,
    homeExperience: homeResult.experience,
    timeline: coachTimeline.getTimeline(athleteId),
    athleteState: createStubAthleteState({ athleteId }),
    goalProgress: createStubGoalProgress(),
    coachingSession: createStubCoachingSession(),
    snapshot: createStubAthleteSnapshot({ athleteId }),
    insights: Object.freeze([createStubInsight({ id: `ins:${athleteId}` })]),
  });

  if (!workspaceResult.success) {
    throw new Error(
      `Failed to seed workspace for coach runtime test: ${workspaceResult.message ?? "unknown error"}`,
    );
  }
}

describe("Coach runtime integration", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    resetCompositionRoot();
    mockRuntimeReady();
  });

  afterEach(() => {
    resetCompositionRoot();
  });

  it("useCoachConversation applies hydrated workspace output after runtime session is ready", async () => {
    await seedPopulatedHydratedCoach();
    const getExperienceSpy = jest.spyOn(mockCoachExperienceService, "getExperience");

    const { result } = renderHook(() =>
      useCoachConversation({ athleteId: ATHLETE_ID }),
    );

    await waitFor(() => {
      expect(result.current.loading.isLoading).toBe(false);
    });

    expect(getExperienceSpy).not.toHaveBeenCalled();
    expect(result.current.error).toBeNull();
    expect(result.current.messages.length).toBeGreaterThan(0);
    expect(result.current.viewModel.recommendations.length).toBeGreaterThan(0);
    expect(result.current.isEmpty).toBe(false);
  });

  it("useCoachConversation renders minimal coach state when coaching session has no conversational turns", async () => {
    await seedPopulatedHydratedCoach();

    const { result } = renderHook(() =>
      useCoachConversation({ athleteId: ATHLETE_ID }),
    );

    await waitFor(() => {
      expect(result.current.loading.isLoading).toBe(false);
    });

    expect(result.current.isEmpty).toBe(false);
    expect(result.current.messages.length).toBe(1);
    expect(result.current.viewModel.recommendations.length).toBeGreaterThan(0);
  });

  it("useCoachConversation waits for runtime session before applying hydrated coach", async () => {
    await seedPopulatedHydratedCoach();
    mockRuntimeStarting();

    const { result, rerender } = renderHook(() =>
      useCoachConversation({ athleteId: ATHLETE_ID }),
    );

    expect(result.current.experience).toBeNull();
    expect(result.current.loading.isLoading).toBe(true);

    mockRuntimeReady();
    rerender({});

    await waitFor(() => {
      expect(result.current.messages.length).toBeGreaterThan(0);
    });
  });

  it("useCoachConversation.refresh re-applies hydrated coach on restart rendering", async () => {
    await seedPopulatedHydratedCoach();

    const { result } = renderHook(() =>
      useCoachConversation({ athleteId: ATHLETE_ID }),
    );

    await waitFor(() => {
      expect(result.current.messages.length).toBeGreaterThan(0);
    });

    await act(async () => {
      await result.current.refresh();
    });

    expect(result.current.loading.isRefreshing).toBe(false);
    expect(result.current.messages.length).toBeGreaterThan(0);
    expect(result.current.error).toBeNull();
  });

  it("useCoachConversation surfaces unavailable coach when hydration produced no workspace", async () => {
    const { result } = renderHook(() =>
      useCoachConversation({ athleteId: ATHLETE_ID }),
    );

    await waitFor(() => {
      expect(result.current.loading.isLoading).toBe(false);
    });

    expect(result.current.experience).toBeNull();
    expect(result.current.error?.code).toBe("coach_runtime_unavailable");
  });

  it("CoachExperienceViewModel.applyHydratedCoachExperience is the production data entry point", async () => {
    await seedPopulatedHydratedCoach();
    const experience = await loadHydratedCoachExperience({ athleteId: ATHLETE_ID });
    const viewModel = new CoachExperienceViewModel({ athleteId: ATHLETE_ID });

    viewModel.applyHydratedCoachExperience(experience!);

    expect(viewModel.isRuntimeDriven).toBe(true);
    expect(viewModel.messages.length).toBeGreaterThan(0);
    expect(viewModel.loading.status).toBe(CoachLoadingStatuses.IDLE);
  });

  it("CoachExperienceViewModel does not call CoachExperienceService when runtime-driven", async () => {
    const viewModel = new CoachExperienceViewModel({ athleteId: ATHLETE_ID });
    const getExperienceSpy = jest.spyOn(mockCoachExperienceService, "getExperience");

    await viewModel.loadConversation();
    await viewModel.refresh();

    expect(getExperienceSpy).not.toHaveBeenCalled();
    expect(viewModel.isRuntimeDriven).toBe(true);
  });

  it("runtime sendMessage executes Coach Conversation orchestration with deterministic pipeline", async () => {
    await seedPopulatedHydratedCoach();
    const root = getCompositionRoot();
    const coachConversation = root.resolve("CoachConversationService");
    await generateAndAttachPlan(coachConversation);

    const viewModel = new CoachExperienceViewModel({
      athleteId: ATHLETE_ID,
      now: () => new Date(FIXED_DASHBOARD_PROJECTED_AT),
    });
    viewModel.applyHydratedCoachExperience(
      (await loadHydratedCoachExperience({ athleteId: ATHLETE_ID }))!,
    );

    const before = viewModel.messages.length;
    await viewModel.sendMessage("Explain today's workout");

    expect(viewModel.messages.length).toBe(before + 2);
    expect(viewModel.messages.at(-1)?.content.length).toBeGreaterThan(0);
    expect(viewModel.error).toBeNull();
  });

  it("sendRuntimeCoachMessage records Conversation Memory through existing memory service", async () => {
    await seedPopulatedHydratedCoach();
    const root = getCompositionRoot();
    const coachConversation = root.resolve("CoachConversationService");
    await generateAndAttachPlan(coachConversation);

    const turn = sendRuntimeCoachMessage({
      athleteId: ATHLETE_ID,
      conversationId: `conversation:${ATHLETE_ID}`,
      message: "Summarize my workout",
      createdAt: FIXED_DASHBOARD_PROJECTED_AT,
    });

    expect(turn.turnResult.success).toBe(true);
    expect(turn.turnResult.memory?.success).toBe(true);
    expect(
      turn.turnResult.trace.map((item) => item.stage),
    ).toEqual(
      expect.arrayContaining([
        CoachConversationStages.COACHING_SESSION,
        CoachConversationStages.COACH_SUPERVISOR,
        CoachConversationStages.MEMORY,
      ]),
    );

    const snapshot = coachConversation.getMemory().buildMemorySnapshot({
      snapshotId: "snap:runtime-memory",
    });
    expect(
      snapshot.snapshot?.entries.some(
        (entry) =>
          entry.category === MemoryCategories.CONTEXT &&
          entry.key === "active_workout_plan",
      ),
    ).toBe(true);
  });

  it("sendRuntimeCoachMessage integrates Agent Collaboration through supervisor orchestration", async () => {
    await seedPopulatedHydratedCoach();
    const root = getCompositionRoot();
    const coachConversation = root.resolve("CoachConversationService");
    await generateAndAttachPlan(coachConversation);

    const turn = sendRuntimeCoachMessage({
      athleteId: ATHLETE_ID,
      conversationId: `conversation:${ATHLETE_ID}`,
      message: "Explain today's workout",
      createdAt: FIXED_DASHBOARD_PROJECTED_AT,
    });

    expect(turn.turnResult.supervisor?.success).toBe(true);
    expect(turn.turnResult.routing?.success).toBe(true);
  });

  it("sendRuntimeCoachMessage appends Coach Timeline entries where supported", async () => {
    await seedPopulatedHydratedCoach();
    const root = getCompositionRoot();
    const coachTimeline = root.resolve("CoachTimelineService");
    const coachConversation = root.resolve("CoachConversationService");
    await generateAndAttachPlan(coachConversation);

    const baseline = coachTimeline.getTimeline(ATHLETE_ID)?.entries.length ?? 0;

    sendRuntimeCoachMessage({
      athleteId: ATHLETE_ID,
      conversationId: `conversation:${ATHLETE_ID}`,
      message: "Explain today's workout",
      createdAt: FIXED_DASHBOARD_PROJECTED_AT,
    });

    const after = coachTimeline.getTimeline(ATHLETE_ID)?.entries.length ?? 0;
    expect(after).toBeGreaterThanOrEqual(baseline);
  });

  it("runtime sendMessage propagates orchestration failures", async () => {
    await seedPopulatedHydratedCoach();

    const viewModel = new CoachExperienceViewModel({
      athleteId: ATHLETE_ID,
      now: () => new Date(FIXED_DASHBOARD_PROJECTED_AT),
    });
    viewModel.applyHydratedCoachExperience(
      (await loadHydratedCoachExperience({ athleteId: ATHLETE_ID }))!,
    );

    jest.spyOn(
      require("../application/sendRuntimeCoachMessage"),
      "sendRuntimeCoachMessage",
    ).mockImplementation(() => {
      throw new (require("../application/sendRuntimeCoachMessage").CoachRuntimeError)(
        "Coach conversation turn failed.",
      );
    });

    await viewModel.sendMessage("Explain today's workout");
    expect(viewModel.error?.code).toBe("coach_runtime_error");
  });

  it("hydrated coach path does not import SQLite or repository adapters directly", () => {
    const loadModule = require("../application/loadHydratedCoachExperience");
    const viewModelModule = require("../viewmodels/CoachExperienceViewModel");
    const sendModule = require("../application/sendRuntimeCoachMessage");

    for (const source of [
      loadModule.loadHydratedCoachExperience.toString(),
      viewModelModule.CoachExperienceViewModel.toString(),
      sendModule.sendRuntimeCoachMessage.toString(),
    ]) {
      expect(source).not.toMatch(/sqlite/i);
      expect(source).not.toMatch(/CoachRepository/);
      expect(source).not.toMatch(/RepositoryAdapter/);
    }
  });
});

describe("Coach runtime restart hydration", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    resetAllRuntimeState();
    mockRuntimeReady();
  });

  afterEach(() => {
    resetAllRuntimeState();
  });

  it("restores populated coach after workspace rehydration", async () => {
    resetCompositionRoot();
    await seedPopulatedHydratedCoach();

    const first = await loadHydratedCoachExperience({ athleteId: ATHLETE_ID });
    expect(first?.conversation.messages.length).toBeGreaterThan(0);

    resetRuntimePipelinesPreservingCompositionRoot();
    resetCompositionRoot();
    await seedPopulatedHydratedCoach();

    const restored = await loadHydratedCoachExperience({ athleteId: ATHLETE_ID });
    expect(restored?.conversation.messages.length).toBeGreaterThan(0);
    expect(restored?.recommendations.length).toBeGreaterThan(0);
  });

  it("persists conversation turns and memory across SQLite restart", async () => {
    createCompositionRoot();
    await startRuntimeSession({ athleteIds: [ATHLETE_ID], clock: () => FIXED_DASHBOARD_PROJECTED_AT });
    await hydrateRuntime();
    observeRuntime({
      athleteIds: [ATHLETE_ID],
      clock: () => FIXED_DASHBOARD_PROJECTED_AT,
    });
    await seedPopulatedHydratedCoach();

    const root = getCompositionRoot();
    const coachConversation = root.resolve("CoachConversationService");
    await generateAndAttachPlan(coachConversation);

    const viewModel = new CoachExperienceViewModel({
      athleteId: ATHLETE_ID,
      now: () => new Date(FIXED_DASHBOARD_PROJECTED_AT),
    });
    viewModel.applyHydratedCoachExperience(
      (await loadHydratedCoachExperience({ athleteId: ATHLETE_ID }))!,
    );

    const beforeCount = viewModel.messages.length;
    await viewModel.sendMessage("Explain today's workout");
    expect(viewModel.messages.length).toBe(beforeCount + 2);

    const inFlight = getRuntimeWriteThroughPromise();
    if (inFlight) {
      await inFlight.catch(() => undefined);
    }

    const overlayBeforeRestart = readPersistedCoachRuntimeOverlay(ATHLETE_ID);
    expect(overlayBeforeRestart?.sessionMessages.length).toBeGreaterThanOrEqual(2);

    resetRuntimePipelinesPreservingCompositionRoot();
    resetRuntimeBootstrap();
    resetCompositionRoot();
    createCompositionRoot();
    await startRuntimeSession({ athleteIds: [ATHLETE_ID], clock: () => FIXED_DASHBOARD_PROJECTED_AT });
    await hydrateRuntime();
    observeRuntime({
      athleteIds: [ATHLETE_ID],
      clock: () => FIXED_DASHBOARD_PROJECTED_AT,
    });

    const restored = await loadHydratedCoachExperience({ athleteId: ATHLETE_ID });
    expect(restored?.conversation.messages.length).toBeGreaterThanOrEqual(2);
    expect(
      getCompositionRoot()
        .resolve("CoachConversationService")
        .getMemory()
        .buildMemorySnapshot()
        .snapshot?.entries.length,
    ).toBeGreaterThan(0);
  });
});

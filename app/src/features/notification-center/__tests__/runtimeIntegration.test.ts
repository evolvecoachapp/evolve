import { act, renderHook, waitFor } from "@testing-library/react-native";
import {
  createCompositionRoot,
  getCompositionRoot,
  resetCompositionRoot,
} from "../../../core/composition/createCompositionRoot";
import { CoachTimelineEventCategories } from "../../../features/coach-timeline/models/CoachTimelineEvent";
import { TimelineEventTypes } from "../../../features/coach-timeline/models/TimelineEventType";
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
import { getRuntimeWriteThroughPromise } from "../../../runtime/write-through/RuntimeWriteThroughPipeline";
import { getWriteThroughStatus } from "../../../runtime/write-through/application/getWriteThroughStatus";
import { RUNTIME_WRITE_THROUGH_STATUS } from "../../../runtime/write-through/RuntimeWriteThroughStatus";
import { resetRuntimeSession } from "../../../runtime/session/RuntimeSessionOrchestrator";
import { resetRuntimeObserver } from "../../../runtime/runtime-observer/RuntimeObserver";
import { observeRuntime } from "../../../runtime/runtime-observer/application/observeRuntime";
import { hydrateRuntime } from "../../../runtime/hydration/application/hydrateRuntime";
import { startRuntimeSession } from "../../../runtime/session/application/startRuntimeSession";
import { readPersistedNotificationSessionOverlay, persistNotificationRuntimeMutation } from "../../../runtime/domain-persistence/application/persistNotificationRuntimeMutation";
import { RUNTIME_SESSION_STATUS } from "../../../runtime/session/RuntimeSessionStatus";
import { useRuntimeSession } from "../../../runtime/session/RuntimeSessionContext";
import {
  mockNotificationCenterService,
} from "../providers/MockNotificationCenterService";
import { useNotifications } from "../hooks/useNotifications";
import { loadHydratedNotificationExperience } from "../application/loadHydratedNotificationExperience";
import { NotificationCenterViewModel } from "../viewmodels/NotificationCenterViewModel";
import { NotificationLoadingStatuses } from "../models/NotificationLoadingState";

jest.mock("../../../runtime/session/RuntimeSessionContext", () => ({
  useRuntimeSession: jest.fn(),
}));

const mockedUseRuntimeSession = useRuntimeSession as jest.Mock;

const ATHLETE_ID = FIXED_DASHBOARD_ATHLETE_ID;

async function waitForWriteThrough(): Promise<void> {
  for (let index = 0; index < 50; index += 1) {
    const inFlight = getRuntimeWriteThroughPromise();
    if (inFlight) {
      await inFlight.catch(() => undefined);
    }
    if (getWriteThroughStatus() === RUNTIME_WRITE_THROUGH_STATUS.ready) {
      return;
    }
    await Promise.resolve();
  }
  throw new Error("Write-through did not reach ready state");
}

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

async function seedPopulatedHydratedNotifications(
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
    requestId: `notification:home:${athleteId}`,
    recoveryMetrics: createStubRecoveryMetrics(),
    sleepProfile: createStubSleepProfile(),
    goalProgress: createStubGoalProgress(),
    coachingSession: createStubCoachingSession(),
    planHistory: createStubPlanHistory(),
    workoutPlan: createStubWorkoutPlan(),
  });

  if (!homeResult.success || !homeResult.experience) {
    throw new Error("Failed to seed home experience for notification runtime test.");
  }

  const workspaceResult = unifiedService.build({
    athleteId,
    requestId: `notification:workspace:${athleteId}`,
    generatedAt: FIXED_DASHBOARD_PROJECTED_AT,
    homeExperience: homeResult.experience,
    timeline: coachTimeline.getTimeline(athleteId),
    athleteState: createStubAthleteState({ athleteId }),
    goalProgress: createStubGoalProgress(),
    coachingSession: createStubCoachingSession(),
    snapshot: createStubAthleteSnapshot({ athleteId }),
    insights: Object.freeze([
      createStubInsight({
        id: "insight:notification:1",
        athleteId,
        title: "Deload recommended",
        summary: "Training load increased 12% this week.",
      }),
    ]),
  });

  if (!workspaceResult.success) {
    throw new Error(
      `Failed to seed workspace for notification runtime test: ${workspaceResult.message ?? "unknown error"}`,
    );
  }
}

function seedEmptyHydratedNotifications(athleteId: string = ATHLETE_ID): void {
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
    requestId: `notification:empty:home:${athleteId}`,
    goalProgress: createStubGoalProgress(),
    coachingSession: createStubCoachingSession(),
  });

  if (!homeResult.success || !homeResult.experience) {
    throw new Error("Failed to seed empty home experience for notification runtime test.");
  }

  const workspaceResult = unifiedService.build({
    athleteId,
    requestId: `notification:empty:workspace:${athleteId}`,
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
      `Failed to seed empty workspace for notification runtime test: ${workspaceResult.message ?? "unknown error"}`,
    );
  }
}

describe("Notification runtime integration", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    resetCompositionRoot();
    mockRuntimeReady();
  });

  afterEach(() => {
    resetCompositionRoot();
  });

  it("useNotifications applies hydrated workspace output after runtime session is ready", async () => {
    await seedPopulatedHydratedNotifications();
    const getNotificationsSpy = jest.spyOn(mockNotificationCenterService, "getNotifications");

    const { result } = renderHook(() =>
      useNotifications({ athleteId: ATHLETE_ID }),
    );

    await waitFor(() => {
      expect(result.current.loading.isLoading).toBe(false);
    });

    expect(getNotificationsSpy).not.toHaveBeenCalled();
    expect(result.current.coachNotifications.length).toBeGreaterThan(0);
    expect(result.current.error).toBeNull();
    expect(result.current.viewModel.isRuntimeDriven).toBe(true);
  });

  it("useNotifications waits for runtime session before applying hydrated notifications", async () => {
    await seedPopulatedHydratedNotifications();
    mockRuntimeStarting();

    const { result, rerender } = renderHook(() =>
      useNotifications({ athleteId: ATHLETE_ID }),
    );

    expect(result.current.coachNotifications.length).toBe(0);
    expect(result.current.loading.isLoading).toBe(true);

    mockRuntimeReady();
    rerender({});

    await waitFor(() => {
      expect(result.current.coachNotifications.length).toBeGreaterThan(0);
    });
  });

  it("useNotifications surfaces empty state when workspace has no notification sources", async () => {
    seedEmptyHydratedNotifications();

    const { result } = renderHook(() =>
      useNotifications({ athleteId: ATHLETE_ID }),
    );

    await waitFor(() => {
      expect(result.current.loading.isLoading).toBe(false);
    });

    expect(result.current.isEmpty).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it("useNotifications surfaces unavailable notifications when hydration produced no workspace", async () => {
    const { result } = renderHook(() =>
      useNotifications({ athleteId: ATHLETE_ID }),
    );

    await waitFor(() => {
      expect(result.current.loading.isLoading).toBe(false);
    });

    expect(result.current.error?.code).toBe("notification_runtime_unavailable");
  });

  it("NotificationCenterViewModel.applyHydratedNotifications is the production data entry point", async () => {
    await seedPopulatedHydratedNotifications();
    const data = await loadHydratedNotificationExperience({ athleteId: ATHLETE_ID });
    const viewModel = new NotificationCenterViewModel({ athleteId: ATHLETE_ID });

    viewModel.applyHydratedNotifications(data!);

    expect(viewModel.isRuntimeDriven).toBe(true);
    expect(viewModel.coachNotifications.length).toBeGreaterThan(0);
    expect(viewModel.loading.status).toBe(NotificationLoadingStatuses.IDLE);
  });

  it("NotificationCenterViewModel does not call NotificationCenterService when runtime-driven", async () => {
    const viewModel = new NotificationCenterViewModel({ athleteId: ATHLETE_ID });
    const getNotificationsSpy = jest.spyOn(mockNotificationCenterService, "getNotifications");

    await viewModel.loadNotifications();
    await viewModel.refresh();

    expect(getNotificationsSpy).not.toHaveBeenCalled();
    expect(viewModel.isRuntimeDriven).toBe(true);
  });

  it("runtime dismiss and markRead mutate notification state without mock service", async () => {
    await seedPopulatedHydratedNotifications();
    const viewModel = new NotificationCenterViewModel({
      athleteId: ATHLETE_ID,
      now: () => new Date(FIXED_DASHBOARD_PROJECTED_AT),
    });
    viewModel.applyHydratedNotifications(
      (await loadHydratedNotificationExperience({ athleteId: ATHLETE_ID }))!,
    );

    const coachId = viewModel.coachNotifications[0]!.id;
    await viewModel.markRead(coachId);
    expect(viewModel.coachNotifications.find((item) => item.id === coachId)?.readAt).not.toBeNull();

    await viewModel.dismiss(coachId);
    expect(viewModel.coachNotifications.find((item) => item.id === coachId)).toBeUndefined();
  });

  it("runtime reminder CRUD updates reminders without mock service", async () => {
    await seedPopulatedHydratedNotifications();
    const viewModel = new NotificationCenterViewModel({
      athleteId: ATHLETE_ID,
      now: () => new Date(FIXED_DASHBOARD_PROJECTED_AT),
    });
    viewModel.applyHydratedNotifications(
      (await loadHydratedNotificationExperience({ athleteId: ATHLETE_ID }))!,
    );

    const reminder = Object.freeze({
      id: "rem-runtime-1",
      type: "hydration" as const,
      title: "Hydration",
      message: "Drink water",
      schedule: Object.freeze({
        dayOfWeek: Object.freeze([1, 2, 3, 4, 5]),
        timeOfDay: "10:00",
        deliveryPolicy: "daily" as const,
        enabled: true,
      }),
      deliveryPolicy: "daily" as const,
      enabled: true,
      createdAt: FIXED_DASHBOARD_PROJECTED_AT,
      updatedAt: FIXED_DASHBOARD_PROJECTED_AT,
    });

    await viewModel.addReminder(reminder);
    expect(viewModel.reminders.some((item) => item.id === reminder.id)).toBe(true);

    const updated = Object.freeze({ ...reminder, title: "Hydration check" });
    await viewModel.editReminder(updated);
    expect(viewModel.reminders.find((item) => item.id === reminder.id)?.title).toBe("Hydration check");

    await viewModel.removeReminder(reminder.id);
    expect(viewModel.reminders.some((item) => item.id === reminder.id)).toBe(false);
  });

  it("dismiss appends notification_dismissed timeline entry", async () => {
    await seedPopulatedHydratedNotifications();
    const root = getCompositionRoot();
    const coachTimeline = root.resolve("CoachTimelineService");
    const viewModel = new NotificationCenterViewModel({
      athleteId: ATHLETE_ID,
      now: () => new Date(FIXED_DASHBOARD_PROJECTED_AT),
    });
    viewModel.applyHydratedNotifications(
      (await loadHydratedNotificationExperience({ athleteId: ATHLETE_ID }))!,
    );

    const coachId = viewModel.coachNotifications[0]!.id;
    await viewModel.dismiss(coachId);

    const timeline = coachTimeline.getTimeline(ATHLETE_ID);
    expect(
      timeline?.entries.some(
        (entry) =>
          entry.metadata.eventType === TimelineEventTypes.NOTIFICATION_DISMISSED &&
          entry.metadata.notificationId === coachId,
      ),
    ).toBe(true);
  });

  it("loadHydratedNotificationExperience does not import NotificationCenterService", () => {
    const loadModule = require("../application/loadHydratedNotificationExperience");
    expect(loadModule.loadHydratedNotificationExperience.toString()).not.toContain(
      "NotificationCenterService",
    );
    expect(loadModule.loadHydratedNotificationExperience.toString()).not.toContain(
      "mockNotificationCenterService",
    );
  });

  it("hydration restores dismissed notifications from timeline journal", async () => {
    await seedPopulatedHydratedNotifications();
    const viewModel = new NotificationCenterViewModel({
      athleteId: ATHLETE_ID,
      now: () => new Date(FIXED_DASHBOARD_PROJECTED_AT),
    });
    const first = await loadHydratedNotificationExperience({ athleteId: ATHLETE_ID });
    viewModel.applyHydratedNotifications(first!);

    const coachId = viewModel.coachNotifications[0]!.id;
    await viewModel.dismiss(coachId);

    const restored = await loadHydratedNotificationExperience({ athleteId: ATHLETE_ID });
    expect(restored?.coachNotifications.some((item) => item.id === coachId)).toBe(false);
  });

  it("propagates runtime failures from unavailable workspace", async () => {
    const viewModel = new NotificationCenterViewModel({ athleteId: ATHLETE_ID });
    await viewModel.dismiss("missing-id");
    expect(viewModel.error?.code).toBe("notification_runtime_unavailable");
  });

  it("persists read state, settings, and reminder edits across SQLite restart", async () => {
    createCompositionRoot();
    await startRuntimeSession({ athleteIds: [ATHLETE_ID], clock: () => FIXED_DASHBOARD_PROJECTED_AT });
    await hydrateRuntime();
    observeRuntime({
      athleteIds: [ATHLETE_ID],
      clock: () => FIXED_DASHBOARD_PROJECTED_AT,
    });
    await seedPopulatedHydratedNotifications();

    const reminder = Object.freeze({
      id: "rem-persist-1",
      type: "hydration" as const,
      title: "Hydration check",
      message: "Drink water",
      schedule: Object.freeze({
        dayOfWeek: Object.freeze([1, 2, 3, 4, 5]),
        timeOfDay: "10:00",
        deliveryPolicy: "daily" as const,
        enabled: true,
      }),
      deliveryPolicy: "daily" as const,
      enabled: true,
      createdAt: FIXED_DASHBOARD_PROJECTED_AT,
      updatedAt: FIXED_DASHBOARD_PROJECTED_AT,
    });

    persistNotificationRuntimeMutation({
      athleteId: ATHLETE_ID,
      requestId: "notification:restart:1",
      overlay: Object.freeze({
        readNotificationIds: Object.freeze(["insight:notification:1"]),
        dismissedNotificationIds: Object.freeze([]),
        reminders: Object.freeze([reminder]),
        deletedReminderIds: Object.freeze([]),
        settings: Object.freeze({
          workoutReminders: true,
          nutritionReminders: false,
          hydrationReminders: true,
          recoveryReminders: false,
          sleepReminders: false,
          coachMessages: true,
          progressUpdates: false,
          globalDeliveryPolicy: "manual" as const,
          quietHoursEnabled: false,
          quietHoursStart: "22:00",
          quietHoursEnd: "07:00",
        }),
      }),
    });
    await waitForWriteThrough();

    resetRuntimePipelinesPreservingCompositionRoot();
    resetRuntimeBootstrap();
    resetCompositionRoot();
    createCompositionRoot();
    await startRuntimeSession({ athleteIds: [ATHLETE_ID], clock: () => FIXED_DASHBOARD_PROJECTED_AT });
    await hydrateRuntime();

    const restored = await loadHydratedNotificationExperience({ athleteId: ATHLETE_ID });
    expect(restored?.settings.workoutReminders).toBe(true);
    expect(
      restored?.coachNotifications.find((item) => item.id === "insight:notification:1")
        ?.readAt,
    ).not.toBeNull();
    expect(restored?.reminders.find((item) => item.id === reminder.id)?.title).toBe(
      "Hydration check",
    );
  });
});

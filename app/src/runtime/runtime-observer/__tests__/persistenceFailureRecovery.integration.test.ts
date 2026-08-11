import {
  createCompositionRoot,
  getCompositionRoot,
  resetCompositionRoot,
} from "../../../core/composition/createCompositionRoot";
import { resetNativeSQLiteTestState } from "../../../infrastructure/sqlite/testSupport/resetNativeSQLiteTestState";
import {
  composeTestWorkspaceForAthlete,
  FIXED_DASHBOARD_ATHLETE_ID,
} from "../../../integrations/dashboard-projection/testSupport/fixtures";
import { createWorkoutRuntime } from "../../../features/workout-runtime/models/experience/WorkoutRuntime";
import {
  createWorkoutRuntimeState,
  WorkoutRuntimeStatuses,
} from "../../../features/workout-runtime/models/experience/WorkoutRuntimeState";
import { createWorkoutProgress } from "../../../features/workout-runtime/models/experience/WorkoutProgress";
import {
  createWorkoutTimer,
  WorkoutTimerStatuses,
} from "../../../features/workout-runtime/models/experience/WorkoutTimer";
import { createWorkoutStatistics } from "../../../features/workout-runtime/models/experience/WorkoutStatistics";
import { createWorkoutNotes } from "../../../features/workout-runtime/models/experience/WorkoutNotes";
import { resetRuntimeBootstrap } from "../../bootstrap/RuntimeBootstrap";
import { resetRepositoryHydration } from "../../hydration/RepositoryHydrationPipeline";
import { hydrateRuntime } from "../../hydration/application/hydrateRuntime";
import { resetDashboardRestore } from "../../dashboard-restore/DashboardRestorePipeline";
import {
  getRuntimeWriteThroughPromise,
  resetRuntimeWriteThrough,
} from "../../write-through/RuntimeWriteThroughPipeline";
import { getWriteThroughStatus } from "../../write-through/application/getWriteThroughStatus";
import { RUNTIME_WRITE_THROUGH_STATUS } from "../../write-through/RuntimeWriteThroughStatus";
import type { RuntimeWriteThroughStatus } from "../../write-through/RuntimeWriteThroughStatus";
import { resetRuntimeSession } from "../../session/RuntimeSessionOrchestrator";
import { startRuntimeSession } from "../../session/application/startRuntimeSession";
import { resetRuntimeObserver } from "../RuntimeObserver";
import { observeRuntime } from "../application/observeRuntime";
import { getRuntimeObserverStatus } from "../application/getRuntimeObserverStatus";
import { RUNTIME_OBSERVER_STATUS } from "../RuntimeObserverStatus";
import {
  persistGoalProgressRuntimeMutation,
  persistCoachRuntimeMutation,
  readPersistedCoachRuntimeOverlay,
  persistNutritionRuntimeMutation,
  persistRecoveryRuntimeMutation,
  persistWorkoutRuntimeMutation,
  readPersistedGoalRuntimeOverlay,
  readPersistedNutritionDayState,
  readPersistedRecoveryDayState,
  readPersistedWorkoutRuntime,
} from "../../domain-persistence/application";
import {
  persistNotificationRuntimeMutation,
  readPersistedNotificationSessionOverlay,
} from "../../domain-persistence/application/persistNotificationRuntimeMutation";

const ATHLETE_ID = FIXED_DASHBOARD_ATHLETE_ID;
const ISO_DATE = "2026-08-11";
const FIXED_CLOCK = () => "2026-08-11T10:00:00.000Z";

function createSampleWorkoutRuntime(label: string, setIndex: number) {
  return createWorkoutRuntime({
    id: `workout:runtime:${label}`,
    title: `Strength Block ${label}`,
    subtitle: "Week 3",
    muscleGroups: "Upper",
    exercises: Object.freeze([]),
    currentExerciseIndex: 0,
    currentSetIndex: setIndex,
    progress: createWorkoutProgress({
      totalExercises: 4,
      completedExercises: 1,
      remainingExercises: 3,
      totalSets: 8,
      completedSets: setIndex,
      remainingSets: 8 - setIndex,
      completionPercent: (setIndex / 8) * 100,
      estimatedRemainingMinutes: 30,
      durationSeconds: 120,
    }),
    timer: createWorkoutTimer({
      status: WorkoutTimerStatuses.IDLE,
      targetSeconds: 90,
      remainingSeconds: 90,
      elapsedSeconds: 0,
      isOvertime: false,
      label: "Rest",
    }),
    statistics: createWorkoutStatistics({
      totalVolume: 1000,
      completedSets: setIndex,
      remainingSets: 8 - setIndex,
      averageRpe: 7,
      durationSeconds: 120,
      estimatedRemainingMinutes: 30,
    }),
    notes: createWorkoutNotes(`Mutation ${label}`, FIXED_CLOCK()),
    state: createWorkoutRuntimeState(WorkoutRuntimeStatuses.ACTIVE),
    startedAt: FIXED_CLOCK(),
    finishedAt: null,
    historyDestination: "/history",
    statisticsDestination: "/stats",
    isEmpty: false,
  });
}

function resetRuntimePipelines(): void {
  resetRuntimeObserver();
  resetRuntimeSession();
  resetRepositoryHydration();
  resetDashboardRestore();
  resetRuntimeWriteThrough();
}

function resetAll(): void {
  resetRuntimePipelines();
  resetRuntimeBootstrap();
  resetCompositionRoot();
  resetNativeSQLiteTestState();
}

async function waitForWriteThroughStatus(
  target: RuntimeWriteThroughStatus,
): Promise<void> {
  for (let index = 0; index < 50; index += 1) {
    const inFlight = getRuntimeWriteThroughPromise();
    if (inFlight) {
      await inFlight.catch(() => undefined);
    }
    if (getWriteThroughStatus() === target) {
      return;
    }
    await Promise.resolve();
  }
  throw new Error(`Write-through did not reach status: ${target}`);
}

async function seedWorkspace(): Promise<void> {
  const root = getCompositionRoot();
  root.resolve("UnifiedWorkspaceService").build({
    athleteId: ATHLETE_ID,
    requestId: `persistence-failure:workspace:${ATHLETE_ID}`,
  });
  composeTestWorkspaceForAthlete(root.resolve("UnifiedWorkspaceService"), ATHLETE_ID);
}

/** Forces the next write to the given repository adapter to throw once. */
function failNextSave(
  repositoryKey:
    | "identity"
    | "runtime"
    | "workspace"
    | "snapshot"
    | "timeline"
    | "workout"
    | "nutrition"
    | "recovery",
): jest.SpyInstance {
  const adapters = getCompositionRoot().resolve("RepositoryAdapters");
  return jest.spyOn(adapters[repositoryKey], "save").mockImplementationOnce(() => {
    throw new Error(`simulated ${repositoryKey} repository failure`);
  });
}

describe("Sprint 36.4 — Runtime Persistence Failure Recovery (domain + restart integration)", () => {
  beforeEach(async () => {
    createCompositionRoot();
    await startRuntimeSession({ athleteIds: [ATHLETE_ID], clock: FIXED_CLOCK });
    await hydrateRuntime();
    observeRuntime({ athleteIds: [ATHLETE_ID], clock: FIXED_CLOCK });
    await seedWorkspace();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    resetAll();
  });

  describe("latest mutation wins", () => {
    it("Mutation A succeeds, Mutation B fails, Mutation C succeeds — SQLite and hydration reflect only C", async () => {
      const runtimeA = createSampleWorkoutRuntime("A", 1);
      persistWorkoutRuntimeMutation({
        athleteId: ATHLETE_ID,
        requestId: "latest-wins:A",
        runtime: runtimeA,
      });
      await waitForWriteThroughStatus(RUNTIME_WRITE_THROUGH_STATUS.ready);

      failNextSave("workout");
      const runtimeB = createSampleWorkoutRuntime("B", 2);
      persistWorkoutRuntimeMutation({
        athleteId: ATHLETE_ID,
        requestId: "latest-wins:B",
        runtime: runtimeB,
      });
      await waitForWriteThroughStatus(RUNTIME_WRITE_THROUGH_STATUS.failed);

      // In-memory state already reflects B even though persistence failed —
      // the failed write-through must never roll back the domain mutation.
      expect(readPersistedWorkoutRuntime(ATHLETE_ID)).toEqual(runtimeB);
      expect(getRuntimeObserverStatus()).toBe(RUNTIME_OBSERVER_STATUS.ready);

      const runtimeC = createSampleWorkoutRuntime("C", 3);
      persistWorkoutRuntimeMutation({
        athleteId: ATHLETE_ID,
        requestId: "latest-wins:C",
        runtime: runtimeC,
      });
      await waitForWriteThroughStatus(RUNTIME_WRITE_THROUGH_STATUS.ready);

      expect(readPersistedWorkoutRuntime(ATHLETE_ID)).toEqual(runtimeC);

      resetRuntimePipelines();
      resetRuntimeBootstrap();
      await startRuntimeSession({ athleteIds: [ATHLETE_ID], clock: FIXED_CLOCK });
      await hydrateRuntime();

      // SQLite (via hydration after a full restart) contains C — not B, and
      // not a stale partial mix of A and B.
      expect(readPersistedWorkoutRuntime(ATHLETE_ID)).toEqual(runtimeC);
    });
  });

  describe("domain coverage — Workout", () => {
    it("recovers workout persistence after a repository failure", async () => {
      const runtime1 = createSampleWorkoutRuntime("W1", 1);
      persistWorkoutRuntimeMutation({
        athleteId: ATHLETE_ID,
        requestId: "workout:recover:1",
        runtime: runtime1,
      });
      await waitForWriteThroughStatus(RUNTIME_WRITE_THROUGH_STATUS.ready);

      failNextSave("workout");
      const runtime2 = createSampleWorkoutRuntime("W2", 2);
      persistWorkoutRuntimeMutation({
        athleteId: ATHLETE_ID,
        requestId: "workout:recover:2",
        runtime: runtime2,
      });
      await waitForWriteThroughStatus(RUNTIME_WRITE_THROUGH_STATUS.failed);
      expect(readPersistedWorkoutRuntime(ATHLETE_ID)).toEqual(runtime2);

      const runtime3 = createSampleWorkoutRuntime("W3", 3);
      persistWorkoutRuntimeMutation({
        athleteId: ATHLETE_ID,
        requestId: "workout:recover:3",
        runtime: runtime3,
      });
      await waitForWriteThroughStatus(RUNTIME_WRITE_THROUGH_STATUS.ready);

      const adapters = getCompositionRoot().resolve("RepositoryAdapters");
      const saved = adapters.workout.list();
      expect(saved.length).toBeGreaterThan(0);
    });
  });

  describe("domain coverage — Nutrition", () => {
    it("recovers nutrition persistence after a repository failure", async () => {
      persistNutritionRuntimeMutation({
        athleteId: ATHLETE_ID,
        requestId: "nutrition:recover:1",
        isoDate: ISO_DATE,
        toggledMealIds: new Set(["meal:breakfast"]),
        hydrationMl: 500,
      });
      await waitForWriteThroughStatus(RUNTIME_WRITE_THROUGH_STATUS.ready);

      failNextSave("nutrition");
      persistNutritionRuntimeMutation({
        athleteId: ATHLETE_ID,
        requestId: "nutrition:recover:2",
        isoDate: ISO_DATE,
        toggledMealIds: new Set(["meal:breakfast", "meal:lunch"]),
        hydrationMl: 900,
      });
      await waitForWriteThroughStatus(RUNTIME_WRITE_THROUGH_STATUS.failed);
      expect(readPersistedNutritionDayState(ATHLETE_ID, ISO_DATE)?.hydrationMl).toBe(
        900,
      );

      persistNutritionRuntimeMutation({
        athleteId: ATHLETE_ID,
        requestId: "nutrition:recover:3",
        isoDate: ISO_DATE,
        toggledMealIds: new Set(["meal:breakfast", "meal:lunch", "meal:dinner"]),
        hydrationMl: 1500,
      });
      await waitForWriteThroughStatus(RUNTIME_WRITE_THROUGH_STATUS.ready);

      resetRuntimePipelines();
      resetRuntimeBootstrap();
      await startRuntimeSession({ athleteIds: [ATHLETE_ID], clock: FIXED_CLOCK });
      await hydrateRuntime();

      const day = readPersistedNutritionDayState(ATHLETE_ID, ISO_DATE);
      expect(day?.hydrationMl).toBe(1500);
      expect(day?.toggledMealIds).toEqual([
        "meal:breakfast",
        "meal:lunch",
        "meal:dinner",
      ]);
    });
  });

  describe("domain coverage — Recovery", () => {
    it("recovers recovery persistence after a repository failure", async () => {
      persistRecoveryRuntimeMutation({
        athleteId: ATHLETE_ID,
        requestId: "recovery:recover:1",
        isoDate: ISO_DATE,
        dayState: {
          sleepHours: 7,
          sleepQuality: 70,
          sleepLogged: true,
          readinessScore: 65,
          assessedScore: 60,
        },
      });
      await waitForWriteThroughStatus(RUNTIME_WRITE_THROUGH_STATUS.ready);

      failNextSave("recovery");
      persistRecoveryRuntimeMutation({
        athleteId: ATHLETE_ID,
        requestId: "recovery:recover:2",
        isoDate: ISO_DATE,
        dayState: {
          sleepHours: 5,
          sleepQuality: 40,
          sleepLogged: true,
          readinessScore: 45,
          assessedScore: 42,
        },
      });
      await waitForWriteThroughStatus(RUNTIME_WRITE_THROUGH_STATUS.failed);
      expect(readPersistedRecoveryDayState(ATHLETE_ID, ISO_DATE)?.sleepHours).toBe(5);

      persistRecoveryRuntimeMutation({
        athleteId: ATHLETE_ID,
        requestId: "recovery:recover:3",
        isoDate: ISO_DATE,
        dayState: {
          sleepHours: 8,
          sleepQuality: 88,
          sleepLogged: true,
          readinessScore: 82,
          assessedScore: 79,
        },
      });
      await waitForWriteThroughStatus(RUNTIME_WRITE_THROUGH_STATUS.ready);

      resetRuntimePipelines();
      resetRuntimeBootstrap();
      await startRuntimeSession({ athleteIds: [ATHLETE_ID], clock: FIXED_CLOCK });
      await hydrateRuntime();

      const day = readPersistedRecoveryDayState(ATHLETE_ID, ISO_DATE);
      expect(day?.sleepHours).toBe(8);
      expect(day?.readinessScore).toBe(82);
    });
  });

  describe("domain coverage — Goal Progress (via Unified Workspace)", () => {
    it("recovers goal progress overlay persistence after a workspace repository failure", async () => {
      persistGoalProgressRuntimeMutation({
        athleteId: ATHLETE_ID,
        requestId: "goal:recover:1",
        reachedMilestoneIds: Object.freeze(["milestone:1"]),
        isCompleted: false,
      });
      await waitForWriteThroughStatus(RUNTIME_WRITE_THROUGH_STATUS.ready);

      failNextSave("workspace");
      persistGoalProgressRuntimeMutation({
        athleteId: ATHLETE_ID,
        requestId: "goal:recover:2",
        reachedMilestoneIds: Object.freeze(["milestone:1", "milestone:2"]),
        isCompleted: false,
      });
      await waitForWriteThroughStatus(RUNTIME_WRITE_THROUGH_STATUS.failed);
      expect(readPersistedGoalRuntimeOverlay(ATHLETE_ID)?.reachedMilestoneIds).toEqual([
        "milestone:1",
        "milestone:2",
      ]);

      persistGoalProgressRuntimeMutation({
        athleteId: ATHLETE_ID,
        requestId: "goal:recover:3",
        reachedMilestoneIds: Object.freeze(["milestone:1", "milestone:2", "milestone:3"]),
        isCompleted: true,
      });
      await waitForWriteThroughStatus(RUNTIME_WRITE_THROUGH_STATUS.ready);

      resetRuntimePipelines();
      resetRuntimeBootstrap();
      await startRuntimeSession({ athleteIds: [ATHLETE_ID], clock: FIXED_CLOCK });
      await hydrateRuntime();

      const overlay = readPersistedGoalRuntimeOverlay(ATHLETE_ID);
      expect(overlay?.reachedMilestoneIds).toEqual([
        "milestone:1",
        "milestone:2",
        "milestone:3",
      ]);
      expect(overlay?.isCompleted).toBe(true);
    });
  });

  describe("domain coverage — Coach (via Unified Workspace)", () => {
    it("recovers coach conversation overlay persistence after a workspace repository failure", async () => {
      const messagesA = Object.freeze([
        Object.freeze({
          id: "user:1",
          role: "user" as const,
          content: "First message",
          createdAt: FIXED_CLOCK(),
        }),
      ]);
      persistCoachRuntimeMutation({
        athleteId: ATHLETE_ID,
        requestId: "coach:recover:1",
        sessionMessages: messagesA,
        sessionId: "session:1",
      });
      await waitForWriteThroughStatus(RUNTIME_WRITE_THROUGH_STATUS.ready);

      failNextSave("workspace");
      const messagesB = Object.freeze([
        ...messagesA,
        Object.freeze({
          id: "coach:1",
          role: "coach" as const,
          content: "Second message",
          createdAt: FIXED_CLOCK(),
        }),
      ]);
      persistCoachRuntimeMutation({
        athleteId: ATHLETE_ID,
        requestId: "coach:recover:2",
        sessionMessages: messagesB,
        sessionId: "session:1",
      });
      await waitForWriteThroughStatus(RUNTIME_WRITE_THROUGH_STATUS.failed);
      expect(readPersistedCoachRuntimeOverlay(ATHLETE_ID)?.sessionMessages).toEqual(
        messagesB,
      );

      const messagesC = Object.freeze([
        ...messagesB,
        Object.freeze({
          id: "user:2",
          role: "user" as const,
          content: "Third message",
          createdAt: FIXED_CLOCK(),
        }),
      ]);
      persistCoachRuntimeMutation({
        athleteId: ATHLETE_ID,
        requestId: "coach:recover:3",
        sessionMessages: messagesC,
        sessionId: "session:1",
      });
      await waitForWriteThroughStatus(RUNTIME_WRITE_THROUGH_STATUS.ready);

      resetRuntimePipelines();
      resetRuntimeBootstrap();
      await startRuntimeSession({ athleteIds: [ATHLETE_ID], clock: FIXED_CLOCK });
      await hydrateRuntime();

      expect(readPersistedCoachRuntimeOverlay(ATHLETE_ID)?.sessionMessages).toEqual(
        messagesC,
      );
    });
  });

  describe("domain coverage — Notification (via Unified Workspace)", () => {
    it("recovers notification overlay persistence after a workspace repository failure", async () => {
      const baseSettings = Object.freeze({
        workoutReminders: true,
        nutritionReminders: false,
        hydrationReminders: false,
        recoveryReminders: false,
        sleepReminders: false,
        coachMessages: true,
        progressUpdates: false,
        globalDeliveryPolicy: "manual" as const,
        quietHoursEnabled: false,
        quietHoursStart: "22:00",
        quietHoursEnd: "07:00",
      });

      persistNotificationRuntimeMutation({
        athleteId: ATHLETE_ID,
        requestId: "notification:recover:1",
        overlay: Object.freeze({
          readNotificationIds: Object.freeze(["notif:1"]),
          dismissedNotificationIds: Object.freeze([]),
          reminders: Object.freeze([]),
          deletedReminderIds: Object.freeze([]),
          settings: baseSettings,
        }),
      });
      await waitForWriteThroughStatus(RUNTIME_WRITE_THROUGH_STATUS.ready);

      failNextSave("workspace");
      persistNotificationRuntimeMutation({
        athleteId: ATHLETE_ID,
        requestId: "notification:recover:2",
        overlay: Object.freeze({
          readNotificationIds: Object.freeze(["notif:1", "notif:2"]),
          dismissedNotificationIds: Object.freeze([]),
          reminders: Object.freeze([]),
          deletedReminderIds: Object.freeze([]),
          settings: baseSettings,
        }),
      });
      await waitForWriteThroughStatus(RUNTIME_WRITE_THROUGH_STATUS.failed);
      expect(
        readPersistedNotificationSessionOverlay(ATHLETE_ID)?.readNotificationIds,
      ).toEqual(["notif:1", "notif:2"]);

      persistNotificationRuntimeMutation({
        athleteId: ATHLETE_ID,
        requestId: "notification:recover:3",
        overlay: Object.freeze({
          readNotificationIds: Object.freeze(["notif:1", "notif:2", "notif:3"]),
          dismissedNotificationIds: Object.freeze(["notif:1"]),
          reminders: Object.freeze([]),
          deletedReminderIds: Object.freeze([]),
          settings: baseSettings,
        }),
      });
      await waitForWriteThroughStatus(RUNTIME_WRITE_THROUGH_STATUS.ready);

      resetRuntimePipelines();
      resetRuntimeBootstrap();
      await startRuntimeSession({ athleteIds: [ATHLETE_ID], clock: FIXED_CLOCK });
      await hydrateRuntime();

      const overlay = readPersistedNotificationSessionOverlay(ATHLETE_ID);
      expect(overlay?.readNotificationIds).toEqual(["notif:1", "notif:2", "notif:3"]);
      expect(overlay?.dismissedNotificationIds).toEqual(["notif:1"]);
    });
  });

  describe("restart lifecycle", () => {
    it("mutation -> persistence failure -> later successful mutation -> reset runtime -> hydrate -> final state matches the last successful mutation", async () => {
      persistWorkoutRuntimeMutation({
        athleteId: ATHLETE_ID,
        requestId: "restart:1",
        runtime: createSampleWorkoutRuntime("restart-1", 1),
      });
      await waitForWriteThroughStatus(RUNTIME_WRITE_THROUGH_STATUS.ready);

      failNextSave("workout");
      persistWorkoutRuntimeMutation({
        athleteId: ATHLETE_ID,
        requestId: "restart:2",
        runtime: createSampleWorkoutRuntime("restart-2", 2),
      });
      await waitForWriteThroughStatus(RUNTIME_WRITE_THROUGH_STATUS.failed);

      const finalRuntime = createSampleWorkoutRuntime("restart-final", 5);
      persistWorkoutRuntimeMutation({
        athleteId: ATHLETE_ID,
        requestId: "restart:3",
        runtime: finalRuntime,
      });
      await waitForWriteThroughStatus(RUNTIME_WRITE_THROUGH_STATUS.ready);

      resetRuntimePipelines();
      resetRuntimeBootstrap();
      await startRuntimeSession({ athleteIds: [ATHLETE_ID], clock: FIXED_CLOCK });
      await hydrateRuntime();

      expect(readPersistedWorkoutRuntime(ATHLETE_ID)).toEqual(finalRuntime);
    });
  });
});

import {
  createCompositionRoot,
  getCompositionRoot,
  resetCompositionRoot,
} from "../../../core/composition/createCompositionRoot";
import { resetNativeSQLiteTestState } from "../../../infrastructure/sqlite/testSupport/resetNativeSQLiteTestState";
import { composeTestWorkspaceForAthlete } from "../../../integrations/dashboard-projection/testSupport/fixtures";
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
import { BOOTSTRAP_STATUS } from "../../bootstrap/BootstrapStatus";
import { resetRuntimeBootstrap } from "../../bootstrap/RuntimeBootstrap";
import { getBootstrapStateHolder } from "../../bootstrap/BootstrapStateHolder";
import { resetRepositoryHydration } from "../../hydration/RepositoryHydrationPipeline";
import { hydrateRuntime } from "../../hydration/application/hydrateRuntime";
import { HYDRATION_STATUS } from "../../hydration/HydrationStatus";
import { getHydrationStateHolder } from "../../hydration/HydrationStateHolder";
import { resetDashboardRestore } from "../../dashboard-restore/DashboardRestorePipeline";
import { restoreDashboard } from "../../dashboard-restore/application/restoreDashboard";
import { DASHBOARD_RESTORE_STATUS } from "../../dashboard-restore/DashboardRestoreStatus";
import { getDashboardRestoreStateHolder } from "../../dashboard-restore/DashboardRestoreStateHolder";
import {
  getRuntimeWriteThroughPromise,
  resetRuntimeWriteThrough,
} from "../../write-through/RuntimeWriteThroughPipeline";
import { getWriteThroughStatus } from "../../write-through/application/getWriteThroughStatus";
import { RUNTIME_WRITE_THROUGH_STATUS } from "../../write-through/RuntimeWriteThroughStatus";
import type { RuntimeWriteThroughStatus } from "../../write-through/RuntimeWriteThroughStatus";
import { getRuntimeWriteThroughStateHolder } from "../../write-through/RuntimeWriteThroughStateHolder";
import {
  getAppliedWriteThroughSequence,
  getCurrentRuntimeMutationSequence,
} from "../../write-through/RuntimeWriteThroughSequence";
import { resetRuntimeSession } from "../../session/RuntimeSessionOrchestrator";
import { startRuntimeSession } from "../../session/application/startRuntimeSession";
import { resetRuntimeObserver } from "../RuntimeObserver";
import { observeRuntime } from "../application/observeRuntime";
import { getRuntimeObserverStatus } from "../application/getRuntimeObserverStatus";
import { getRuntimeObserverStateHolder } from "../RuntimeObserverStateHolder";
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

const ATHLETE_A = "athlete:sprint365:userA";
const ATHLETE_B = "athlete:sprint365:userB";
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

async function seedWorkspace(athleteId: string): Promise<void> {
  const root = getCompositionRoot();
  root.resolve("UnifiedWorkspaceService").build({
    athleteId,
    requestId: `consistency-guard:workspace:${athleteId}`,
  });
  composeTestWorkspaceForAthlete(root.resolve("UnifiedWorkspaceService"), athleteId);
}

function seedIdentity(athleteId: string, displayName: string): void {
  const root = getCompositionRoot();
  root.resolve("AthleteIdentityService").build({
    athleteId,
    requestId: `consistency-guard:identity:${athleteId}`,
    profile: {
      displayName,
      givenName: displayName.split(" ")[0] ?? displayName,
      familyName: displayName.split(" ")[1] ?? "",
      sex: "unspecified",
      birthYear: 1990,
      experienceLevel: "intermediate",
    },
    locale: { languageTag: "en-US" },
    units: { system: "metric" },
    timeZone: { iana: "Etc/UTC", displayName: "UTC" },
  });
}

async function startSessionFor(athleteId: string): Promise<void> {
  createCompositionRoot();
  await startRuntimeSession({ athleteIds: [athleteId], clock: FIXED_CLOCK });
  await hydrateRuntime();
  observeRuntime({ athleteIds: [athleteId], clock: FIXED_CLOCK });
}

function mutateAllDomains(athleteId: string, label: string): void {
  persistWorkoutRuntimeMutation({
    athleteId,
    requestId: `cross-domain:workout:${label}`,
    runtime: createSampleWorkoutRuntime(label, 3),
  });
  persistNutritionRuntimeMutation({
    athleteId,
    requestId: `cross-domain:nutrition:${label}`,
    isoDate: ISO_DATE,
    toggledMealIds: new Set(["meal:breakfast", "meal:lunch"]),
    hydrationMl: 1200,
  });
  persistRecoveryRuntimeMutation({
    athleteId,
    requestId: `cross-domain:recovery:${label}`,
    isoDate: ISO_DATE,
    dayState: {
      sleepHours: 7.5,
      sleepQuality: 75,
      sleepLogged: true,
      readinessScore: 70,
      assessedScore: 68,
    },
  });
  persistGoalProgressRuntimeMutation({
    athleteId,
    requestId: `cross-domain:goal:${label}`,
    reachedMilestoneIds: Object.freeze(["milestone:1", "milestone:2"]),
    isCompleted: false,
  });
  persistCoachRuntimeMutation({
    athleteId,
    requestId: `cross-domain:coach:${label}`,
    sessionMessages: Object.freeze([
      Object.freeze({
        id: `coach:message:${label}`,
        role: "user" as const,
        content: `Message from ${label}`,
        createdAt: FIXED_CLOCK(),
      }),
    ]),
    sessionId: `session:${label}`,
  });
  persistNotificationRuntimeMutation({
    athleteId,
    requestId: `cross-domain:notification:${label}`,
    overlay: Object.freeze({
      readNotificationIds: Object.freeze([`notif:${label}`]),
      dismissedNotificationIds: Object.freeze([]),
      reminders: Object.freeze([]),
      deletedReminderIds: Object.freeze([]),
      settings: Object.freeze({
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
      }),
    }),
  });
}

describe("Sprint 36.5 — Runtime Persistence Verification & Consistency Guard (integration)", () => {
  afterEach(() => {
    jest.restoreAllMocks();
    resetAll();
  });

  describe("cross-domain consistency", () => {
    it("persists workout + nutrition + recovery + goal + coach + notification mutations together and restores all of them after a full restart", async () => {
      await startSessionFor(ATHLETE_A);
      seedIdentity(ATHLETE_A, "Alex Rivera");
      await seedWorkspace(ATHLETE_A);

      mutateAllDomains(ATHLETE_A, "first");
      await waitForWriteThroughStatus(RUNTIME_WRITE_THROUGH_STATUS.ready);

      // A second round of mutations across every domain in the same
      // session, proving one domain's write-through does not corrupt or
      // clobber another's already-persisted state.
      mutateAllDomains(ATHLETE_A, "final");
      await waitForWriteThroughStatus(RUNTIME_WRITE_THROUGH_STATUS.ready);

      resetRuntimePipelines();
      resetRuntimeBootstrap();
      await startRuntimeSession({ athleteIds: [ATHLETE_A], clock: FIXED_CLOCK });
      await hydrateRuntime();

      expect(readPersistedWorkoutRuntime(ATHLETE_A)?.id).toBe(
        "workout:runtime:final",
      );
      expect(readPersistedNutritionDayState(ATHLETE_A, ISO_DATE)?.hydrationMl).toBe(
        1200,
      );
      expect(readPersistedRecoveryDayState(ATHLETE_A, ISO_DATE)?.sleepHours).toBe(
        7.5,
      );
      expect(readPersistedGoalRuntimeOverlay(ATHLETE_A)?.reachedMilestoneIds).toEqual(
        ["milestone:1", "milestone:2"],
      );
      expect(
        readPersistedCoachRuntimeOverlay(ATHLETE_A)?.sessionMessages[0]?.content,
      ).toBe("Message from final");
      expect(
        readPersistedNotificationSessionOverlay(ATHLETE_A)?.readNotificationIds,
      ).toEqual(["notif:final"]);

      const root = getCompositionRoot();
      expect(
        root.resolve("AthleteIdentityService").getAthleteIdentity(ATHLETE_A)
          ?.profile.displayName,
      ).toBe("Alex Rivera");
      expect(
        root.resolve("UnifiedWorkspaceService").getWorkspace(ATHLETE_A)?.athleteId,
      ).toBe(ATHLETE_A);
    });
  });

  describe("dashboard consistency", () => {
    it("reflects hydrated workspace state on the Home Dashboard after a full restart, never a mock/empty fallback", async () => {
      await startSessionFor(ATHLETE_A);
      seedIdentity(ATHLETE_A, "Alex Rivera");
      await seedWorkspace(ATHLETE_A);
      mutateAllDomains(ATHLETE_A, "dashboard");
      await waitForWriteThroughStatus(RUNTIME_WRITE_THROUGH_STATUS.ready);

      resetRuntimePipelines();
      resetRuntimeBootstrap();
      await startRuntimeSession({ athleteIds: [ATHLETE_A], clock: FIXED_CLOCK });
      await hydrateRuntime();

      const dashboardResult = await restoreDashboard({ athleteIds: [ATHLETE_A] });

      expect(dashboardResult.primaryDashboard.isEmpty).toBe(false);
      expect(dashboardResult.primaryDashboard.athlete.displayName).toBe(
        "Alex Rivera",
      );
      expect(dashboardResult.emptyCount).toBe(0);
      expect(dashboardResult.projectedCount).toBe(1);
    });
  });

  describe("athlete isolation — domain overlays", () => {
    it("Athlete A persists cross-domain state -> logout -> Athlete B sees none of it -> B persists own state -> Athlete A logs back in and only sees A's own state", async () => {
      // Athlete A persists cross-domain state.
      await startSessionFor(ATHLETE_A);
      seedIdentity(ATHLETE_A, "Alex Rivera");
      await seedWorkspace(ATHLETE_A);
      mutateAllDomains(ATHLETE_A, "athleteA");
      await waitForWriteThroughStatus(RUNTIME_WRITE_THROUGH_STATUS.ready);

      // Logout — full deterministic reset cascade, disk state (SQLite) is
      // retained, only in-memory composition state is torn down.
      resetRuntimePipelines();
      resetRuntimeBootstrap();
      resetCompositionRoot();

      // Athlete B's session starts — hydration must never restore A's data.
      await startRuntimeSession({ athleteIds: [ATHLETE_B], clock: FIXED_CLOCK });
      await hydrateRuntime();
      observeRuntime({ athleteIds: [ATHLETE_B], clock: FIXED_CLOCK });

      expect(readPersistedWorkoutRuntime(ATHLETE_B)).toBeNull();
      expect(readPersistedNutritionDayState(ATHLETE_B, ISO_DATE)).toBeNull();
      expect(readPersistedRecoveryDayState(ATHLETE_B, ISO_DATE)).toBeNull();
      expect(readPersistedGoalRuntimeOverlay(ATHLETE_B)).toBeNull();
      expect(readPersistedCoachRuntimeOverlay(ATHLETE_B)).toBeNull();
      expect(readPersistedNotificationSessionOverlay(ATHLETE_B)).toBeNull();
      const rootB = getCompositionRoot();
      expect(
        rootB.resolve("AthleteIdentityService").getAthleteIdentity(ATHLETE_B),
      ).toBeNull();

      // B persists their own, unrelated state.
      seedIdentity(ATHLETE_B, "Bailey Chen");
      await seedWorkspace(ATHLETE_B);
      mutateAllDomains(ATHLETE_B, "athleteB");
      await waitForWriteThroughStatus(RUNTIME_WRITE_THROUGH_STATUS.ready);

      // Logout B, and Athlete A logs back in.
      resetRuntimePipelines();
      resetRuntimeBootstrap();
      resetCompositionRoot();

      await startRuntimeSession({ athleteIds: [ATHLETE_A], clock: FIXED_CLOCK });
      await hydrateRuntime();

      // A's own cross-domain state is restored intact.
      expect(readPersistedWorkoutRuntime(ATHLETE_A)?.id).toBe(
        "workout:runtime:athleteA",
      );
      expect(readPersistedNutritionDayState(ATHLETE_A, ISO_DATE)?.hydrationMl).toBe(
        1200,
      );
      expect(
        readPersistedCoachRuntimeOverlay(ATHLETE_A)?.sessionMessages[0]?.content,
      ).toBe("Message from athleteA");

      // None of B's data leaks into A's restored session.
      expect(readPersistedWorkoutRuntime(ATHLETE_B)).toBeNull();
      expect(readPersistedNutritionDayState(ATHLETE_B, ISO_DATE)).toBeNull();
      const rootA = getCompositionRoot();
      expect(
        rootA.resolve("AthleteIdentityService").getAthleteIdentity(ATHLETE_B),
      ).toBeNull();
      expect(
        rootA.resolve("AthleteIdentityService").getAthleteIdentity(ATHLETE_A)
          ?.profile.displayName,
      ).toBe("Alex Rivera");
    });
  });

  describe("full reset consistency", () => {
    it("leaves no stale state across Observer, Write-Through, Dashboard Restore, Hydration, Bootstrap, and Session after a full reset", async () => {
      await startSessionFor(ATHLETE_A);
      seedIdentity(ATHLETE_A, "Alex Rivera");
      await seedWorkspace(ATHLETE_A);
      mutateAllDomains(ATHLETE_A, "reset-check");
      await waitForWriteThroughStatus(RUNTIME_WRITE_THROUGH_STATUS.ready);
      await restoreDashboard({ athleteIds: [ATHLETE_A] });

      // Sanity: state is non-trivial before the reset, so the post-reset
      // assertions actually prove something was torn down.
      expect(getRuntimeObserverStateHolder().athleteIds).toEqual([ATHLETE_A]);
      expect(getRuntimeWriteThroughStateHolder().result).not.toBeNull();
      expect(getDashboardRestoreStateHolder().result).not.toBeNull();
      expect(getHydrationStateHolder().result).not.toBeNull();
      expect(getCurrentRuntimeMutationSequence()).toBeGreaterThan(0);
      expect(getAppliedWriteThroughSequence()).toBeGreaterThan(0);

      resetAll();

      expect(getRuntimeObserverStatus()).toBe(RUNTIME_OBSERVER_STATUS.idle);
      expect(getRuntimeObserverStateHolder().result).toBeNull();
      expect(getRuntimeObserverStateHolder().athleteIds).toEqual([]);

      expect(getWriteThroughStatus()).toBe(RUNTIME_WRITE_THROUGH_STATUS.idle);
      expect(getRuntimeWriteThroughStateHolder().result).toBeNull();

      expect(getHydrationStateHolder().status).toBe(HYDRATION_STATUS.idle);
      expect(getHydrationStateHolder().result).toBeNull();

      expect(getDashboardRestoreStateHolder().status).toBe(
        DASHBOARD_RESTORE_STATUS.idle,
      );
      expect(getDashboardRestoreStateHolder().result).toBeNull();

      expect(getBootstrapStateHolder().status).toBe(BOOTSTRAP_STATUS.idle);

      // The monotonic mutation sequence guard resets alongside the observer
      // — a fresh session starts from a clean sequence, never comparing
      // against a stale count left over from the previous athlete/session.
      expect(getCurrentRuntimeMutationSequence()).toBe(0);
      expect(getAppliedWriteThroughSequence()).toBe(0);

      // Deterministic re-start: a brand-new session for a different
      // athlete starts completely clean, with no leftover identity/domain
      // state resolvable through the (recreated) composition root.
      await startRuntimeSession({ athleteIds: [ATHLETE_B], clock: FIXED_CLOCK });
      await hydrateRuntime();
      observeRuntime({ athleteIds: [ATHLETE_B], clock: FIXED_CLOCK });

      expect(getRuntimeObserverStatus()).toBe(RUNTIME_OBSERVER_STATUS.ready);
      expect(getRuntimeObserverStateHolder().athleteIds).toEqual([ATHLETE_B]);
      const root = getCompositionRoot();
      expect(
        root.resolve("AthleteIdentityService").getAthleteIdentity(ATHLETE_A),
      ).toBeNull();
      expect(readPersistedWorkoutRuntime(ATHLETE_A)).toBeNull();
    });
  });
});

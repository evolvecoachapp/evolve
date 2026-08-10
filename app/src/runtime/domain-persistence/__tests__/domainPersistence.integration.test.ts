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
import { createWorkoutRuntimeState, WorkoutRuntimeStatuses } from "../../../features/workout-runtime/models/experience/WorkoutRuntimeState";
import { createWorkoutProgress } from "../../../features/workout-runtime/models/experience/WorkoutProgress";
import { createWorkoutTimer, WorkoutTimerStatuses } from "../../../features/workout-runtime/models/experience/WorkoutTimer";
import { createWorkoutStatistics } from "../../../features/workout-runtime/models/experience/WorkoutStatistics";
import { createWorkoutNotes } from "../../../features/workout-runtime/models/experience/WorkoutNotes";
import { resetRuntimeBootstrap } from "../../bootstrap/RuntimeBootstrap";
import { resetRepositoryHydration } from "../../hydration/RepositoryHydrationPipeline";
import { hydrateRuntime } from "../../hydration/application/hydrateRuntime";
import { resetDashboardRestore } from "../../dashboard-restore/DashboardRestorePipeline";
import { resetRuntimeWriteThrough } from "../../write-through/RuntimeWriteThroughPipeline";
import { getRuntimeWriteThroughPromise } from "../../write-through/RuntimeWriteThroughPipeline";
import { getWriteThroughStatus } from "../../write-through/application/getWriteThroughStatus";
import { RUNTIME_WRITE_THROUGH_STATUS } from "../../write-through/RuntimeWriteThroughStatus";
import { resetRuntimeSession } from "../../session/RuntimeSessionOrchestrator";
import { startRuntimeSession } from "../../session/application/startRuntimeSession";
import { resetRuntimeObserver } from "../../runtime-observer/RuntimeObserver";
import { observeRuntime } from "../../runtime-observer/application/observeRuntime";
import {
  persistGoalProgressRuntimeMutation,
  persistNutritionRuntimeMutation,
  persistRecoveryRuntimeMutation,
  persistWorkoutRuntimeMutation,
  readPersistedGoalRuntimeOverlay,
  readPersistedNutritionDayState,
  readPersistedRecoveryDayState,
  readPersistedWorkoutRuntime,
} from "../application";
import { loadHydratedWorkoutRuntime } from "../../../features/workout-runtime/application/loadHydratedWorkoutRuntime";
import { createNutritionDay } from "../../../features/nutrition-experience/models";
import { loadHydratedNutritionExperience } from "../../../features/nutrition-experience/application/loadHydratedNutritionExperience";
import { loadHydratedRecoveryExperience } from "../../../features/recovery-experience/application/loadHydratedRecoveryExperience";
import { loadHydratedGoalProgressExperience } from "../../../features/goal-progress-experience/application/loadHydratedGoalProgressExperience";
import { WorkoutRuntimePersistenceSerializer } from "../../../infrastructure/repositories/serialization/WorkoutRuntimePersistenceSerialization";
import { NutritionRuntimePersistenceSerializer } from "../../../infrastructure/repositories/serialization/NutritionRuntimePersistenceSerialization";
import { RecoveryRuntimePersistenceSerializer } from "../../../infrastructure/repositories/serialization/RecoveryRuntimePersistenceSerialization";
import { createWorkoutRuntimePersistenceState } from "../models/WorkoutRuntimePersistenceState";
import { createNutritionRuntimePersistenceState } from "../models/NutritionRuntimePersistenceState";
import { createRecoveryRuntimePersistenceState } from "../models/RecoveryRuntimePersistenceState";

const ATHLETE_ID = FIXED_DASHBOARD_ATHLETE_ID;
const ISO_DATE = "2026-08-10";
const FIXED_CLOCK = () => "2026-08-10T10:00:00.000Z";
const TEST_DAY = createNutritionDay({
  id: "today",
  isoDate: ISO_DATE,
  label: "Today",
  shortLabel: "Today",
  relativeLabel: "Today",
  isToday: true,
});

function createSampleWorkoutRuntime() {
  return createWorkoutRuntime({
    id: "workout:runtime:1",
    title: "Strength Block",
    subtitle: "Week 3",
    muscleGroups: "Upper",
    exercises: Object.freeze([]),
    currentExerciseIndex: 0,
    currentSetIndex: 1,
    progress: createWorkoutProgress({
      totalExercises: 4,
      completedExercises: 1,
      remainingExercises: 3,
      totalSets: 8,
      completedSets: 2,
      remainingSets: 6,
      completionPercent: 25,
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
      completedSets: 2,
      remainingSets: 6,
      averageRpe: 7,
      durationSeconds: 120,
      estimatedRemainingMinutes: 30,
    }),
    notes: createWorkoutNotes("Focused session", FIXED_CLOCK()),
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

async function seedWorkspace(): Promise<void> {
  const root = getCompositionRoot();
  root.resolve("UnifiedWorkspaceService").build({
    athleteId: ATHLETE_ID,
    requestId: `domain-persistence:workspace:${ATHLETE_ID}`,
  });
  composeTestWorkspaceForAthlete(root.resolve("UnifiedWorkspaceService"), ATHLETE_ID);
}

describe("domain runtime persistence (Sprint 35.4)", () => {
  afterEach(() => {
    resetAll();
  });

  describe("serialization", () => {
    it("round-trips workout runtime persistence state", () => {
      const state = createWorkoutRuntimePersistenceState({
        athleteId: ATHLETE_ID,
        runtime: createSampleWorkoutRuntime(),
      });
      const roundTrip = WorkoutRuntimePersistenceSerializer.deserialize(
        WorkoutRuntimePersistenceSerializer.serialize(state),
      );
      expect(roundTrip).toEqual(state);
    });

    it("returns null for malformed nutrition payload JSON", () => {
      expect(() =>
        NutritionRuntimePersistenceSerializer.deserialize("{invalid"),
      ).toThrow();
    });

    it("returns null for empty nutrition payload", () => {
      expect(NutritionRuntimePersistenceSerializer.deserialize("{}")).toBeNull();
    });

    it("round-trips recovery runtime persistence state", () => {
      const state = createRecoveryRuntimePersistenceState({
        athleteId: ATHLETE_ID,
        days: Object.freeze({
          [ISO_DATE]: Object.freeze({
            sleepHours: 7.5,
            sleepQuality: 80,
            sleepLogged: true,
            readinessScore: 72,
            assessedScore: 68,
          }),
        }),
      });
      const roundTrip = RecoveryRuntimePersistenceSerializer.deserialize(
        RecoveryRuntimePersistenceSerializer.serialize(state),
      );
      expect(roundTrip).toEqual(state);
    });
  });

  describe("restart persistence integration", () => {
    beforeEach(async () => {
      createCompositionRoot();
      await startRuntimeSession({ athleteIds: [ATHLETE_ID], clock: FIXED_CLOCK });
      await hydrateRuntime();
      observeRuntime({ athleteIds: [ATHLETE_ID], clock: FIXED_CLOCK });
      await seedWorkspace();
    });

    it("persists and restores workout runtime mutations through SQLite", async () => {
      const runtime = createSampleWorkoutRuntime();
      persistWorkoutRuntimeMutation({
        athleteId: ATHLETE_ID,
        requestId: "workout:persist:1",
        runtime,
      });
      await waitForWriteThrough();

      resetRuntimePipelines();
      resetRuntimeBootstrap();
      await startRuntimeSession({ athleteIds: [ATHLETE_ID], clock: FIXED_CLOCK });
      await hydrateRuntime();

      const restored = readPersistedWorkoutRuntime(ATHLETE_ID);
      expect(restored).toEqual(runtime);

      const hydrated = await loadHydratedWorkoutRuntime({ athleteId: ATHLETE_ID });
      expect(hydrated).toEqual(runtime);
    });

    it("persists and restores nutrition meal/hydration overlays", async () => {
      persistNutritionRuntimeMutation({
        athleteId: ATHLETE_ID,
        requestId: "nutrition:persist:1",
        isoDate: ISO_DATE,
        toggledMealIds: new Set(["meal:breakfast"]),
        hydrationMl: 750,
      });
      await waitForWriteThrough();

      resetRuntimePipelines();
      resetRuntimeBootstrap();
      await startRuntimeSession({ athleteIds: [ATHLETE_ID], clock: FIXED_CLOCK });
      await hydrateRuntime();

      const day = readPersistedNutritionDayState(ATHLETE_ID, ISO_DATE);
      expect(day?.toggledMealIds).toEqual(["meal:breakfast"]);
      expect(day?.hydrationMl).toBe(750);

      const dashboard = await loadHydratedNutritionExperience({
        athleteId: ATHLETE_ID,
        day: TEST_DAY,
      });
      expect(dashboard?.hydration.currentMl).toBe(750);
    });

    it("persists and restores recovery runtime overlays", async () => {
      persistRecoveryRuntimeMutation({
        athleteId: ATHLETE_ID,
        requestId: "recovery:persist:1",
        isoDate: ISO_DATE,
        dayState: Object.freeze({
          sleepHours: 8,
          sleepQuality: 85,
          sleepLogged: true,
          readinessScore: 78,
          assessedScore: 74,
        }),
      });
      await waitForWriteThrough();

      resetRuntimePipelines();
      resetRuntimeBootstrap();
      await startRuntimeSession({ athleteIds: [ATHLETE_ID], clock: FIXED_CLOCK });
      await hydrateRuntime();

      const day = readPersistedRecoveryDayState(ATHLETE_ID, ISO_DATE);
      expect(day?.sleepHours).toBe(8);
      expect(day?.readinessScore).toBe(78);

      const dashboard = await loadHydratedRecoveryExperience({ athleteId: ATHLETE_ID });
      expect(dashboard?.sleep.hours).toBe(8);
      expect(dashboard?.readiness.score).toBe(78);
    });

    it("persists and restores goal progress runtime overlay through workspace", async () => {
      persistGoalProgressRuntimeMutation({
        athleteId: ATHLETE_ID,
        requestId: "goal:persist:1",
        reachedMilestoneIds: Object.freeze(["milestone:1"]),
        isCompleted: false,
      });

      const beforeRestart = getCompositionRoot()
        .resolve("UnifiedWorkspaceService")
        .getWorkspace(ATHLETE_ID);
      expect(beforeRestart?.goalRuntimeOverlay?.reachedMilestoneIds).toEqual([
        "milestone:1",
      ]);

      await waitForWriteThrough();

      resetRuntimePipelines();
      resetRuntimeBootstrap();
      await startRuntimeSession({ athleteIds: [ATHLETE_ID], clock: FIXED_CLOCK });
      await hydrateRuntime();

      const overlay = readPersistedGoalRuntimeOverlay(ATHLETE_ID);
      expect(overlay?.reachedMilestoneIds).toEqual(["milestone:1"]);

      const dashboard = await loadHydratedGoalProgressExperience({
        athleteId: ATHLETE_ID,
      });
      expect(
        dashboard?.milestones.find((item) => item.id === "milestone:1")?.reached,
      ).toBe(true);
    });

    it("handles empty domain persistence state on startup", async () => {
      resetAll();
      createCompositionRoot();
      await startRuntimeSession({ athleteIds: [ATHLETE_ID], clock: FIXED_CLOCK });
      const result = await hydrateRuntime();
      expect(readPersistedWorkoutRuntime(ATHLETE_ID)).toBeNull();
      expect(result.workspaceRecordCount).toBe(0);
    });
  });

  describe("immutability", () => {
    it("freezes deserialized nutrition runtime state", () => {
      const state = createNutritionRuntimePersistenceState({
        athleteId: ATHLETE_ID,
        days: Object.freeze({
          [ISO_DATE]: Object.freeze({
            toggledMealIds: Object.freeze(["meal:1"]),
            hydrationMl: 500,
          }),
        }),
      });
      const roundTrip = NutritionRuntimePersistenceSerializer.deserialize(
        NutritionRuntimePersistenceSerializer.serialize(state),
      );
      expect(Object.isFrozen(roundTrip)).toBe(true);
    });
  });
});

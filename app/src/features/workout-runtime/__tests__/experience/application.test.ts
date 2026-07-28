import {
  completeWorkoutSet,
  finishWorkout,
  loadWorkoutRuntime,
  navigateWorkout,
  pauseRestTimer,
  refreshWorkoutRuntime,
  resumeRestTimer,
  startRestTimer,
  tickRestTimer,
  updateWorkoutSet,
} from "../../application";
import { mockWorkoutRuntimeData } from "../../mocks/workoutRuntimeData";
import { WorkoutExerciseStatuses } from "../../models/experience/WorkoutExercise";
import { WorkoutLoadingStatuses } from "../../models/experience/WorkoutLoadingState";
import { WorkoutRuntimeStatuses } from "../../models/experience/WorkoutRuntimeState";
import { WorkoutSetStatuses } from "../../models/experience/WorkoutSet";
import { WorkoutTimerStatuses } from "../../models/experience/WorkoutTimer";
import type { WorkoutRuntimeDto } from "../../types/workoutRuntimeDto";
import type { WorkoutRuntimeExperienceService } from "../../types/workoutRuntimeService";
import { WorkoutRuntimeExperienceError } from "../../types/workoutRuntimeService";

function createService(options?: {
  dto?: WorkoutRuntimeDto;
  fail?: boolean;
  empty?: boolean;
}): WorkoutRuntimeExperienceService {
  return {
    providerId: "mock",
    async getRuntime() {
      if (options?.fail) {
        throw new WorkoutRuntimeExperienceError("load failed", "mock");
      }
      if (options?.empty) {
        return {
          id: "empty",
          title: "No Workout",
          subtitle: "Today's workout",
          muscleGroups: "",
          exercises: [],
          empty: true,
        };
      }
      return {
        ...(options?.dto ?? mockWorkoutRuntimeData),
        exercises: (options?.dto ?? mockWorkoutRuntimeData).exercises.map(
          (exercise) => ({
            ...exercise,
            sets: exercise.sets.map((set) => ({ ...set })),
          }),
        ),
      };
    },
    async finishRuntime() {
      /* no-op */
    },
  };
}

describe("workout runtime experience application", () => {
  it("loadWorkoutRuntime maps provider DTO into immutable presentation model", async () => {
    const runtime = await loadWorkoutRuntime({ service: createService() });

    expect(Object.isFrozen(runtime)).toBe(true);
    expect(runtime.title).toBe("Upper Body Strength");
    expect(runtime.exercises.length).toBe(4);
    expect(runtime.currentExerciseIndex).toBe(0);
    expect(runtime.progress.totalSets).toBeGreaterThan(0);
    expect(runtime.isEmpty).toBe(false);
    expect(runtime.state.status).toBe(WorkoutRuntimeStatuses.READY);
  });

  it("refreshWorkoutRuntime reloads from the provider", async () => {
    const runtime = await refreshWorkoutRuntime({ service: createService() });
    expect(runtime.id).toBe("workout-runtime-today");
  });

  it("loadWorkoutRuntime returns empty state", async () => {
    const runtime = await loadWorkoutRuntime({
      service: createService({ empty: true }),
    });
    expect(runtime.isEmpty).toBe(true);
    expect(runtime.state.status).toBe(WorkoutRuntimeStatuses.EMPTY);
  });

  it("completeWorkoutSet advances cursor and starts rest timer", async () => {
    const runtime = await loadWorkoutRuntime({ service: createService() });
    const next = completeWorkoutSet(runtime, {
      weight: 82.5,
      repetitions: 8,
      rpe: 8,
      now: new Date("2026-07-29T10:00:00.000Z"),
    });

    expect(next.exercises[0].sets[0].completed).toBe(true);
    expect(next.exercises[0].sets[0].weight).toBe(82.5);
    expect(next.currentSetIndex).toBe(1);
    expect(next.timer.status).toBe(WorkoutTimerStatuses.RUNNING);
    expect(next.progress.completedSets).toBe(1);
    expect(next.startedAt).toBe("2026-07-29T10:00:00.000Z");
  });

  it("updateWorkoutSet edits current set values", async () => {
    const runtime = await loadWorkoutRuntime({ service: createService() });
    const next = updateWorkoutSet(runtime, {
      weight: 90,
      repetitions: 5,
      rpe: 9,
    });

    expect(next.exercises[0].sets[0].weight).toBe(90);
    expect(next.exercises[0].sets[0].repetitions).toBe(5);
    expect(next.exercises[0].sets[0].rpe).toBe(9);
  });

  it("navigateWorkout moves next, previous, and skip", async () => {
    const runtime = await loadWorkoutRuntime({ service: createService() });
    const next = navigateWorkout(runtime, "next");
    expect(next.currentExerciseIndex).toBe(1);
    expect(next.exercises[1].status).toBe(WorkoutExerciseStatuses.CURRENT);

    const previous = navigateWorkout(next, "previous");
    expect(previous.currentExerciseIndex).toBe(0);

    const skipped = navigateWorkout(previous, "skip");
    expect(skipped.exercises[0].status).toBe(WorkoutExerciseStatuses.SKIPPED);
    expect(skipped.currentExerciseIndex).toBe(1);
  });

  it("rest timer start / pause / resume / tick", async () => {
    const runtime = await loadWorkoutRuntime({ service: createService() });
    const running = startRestTimer(runtime, 3);
    expect(running.timer.remainingSeconds).toBe(3);
    expect(running.state.status).toBe(WorkoutRuntimeStatuses.RESTING);

    const paused = pauseRestTimer(running);
    expect(paused.timer.status).toBe(WorkoutTimerStatuses.PAUSED);

    const resumed = resumeRestTimer(paused);
    expect(resumed.timer.status).toBe(WorkoutTimerStatuses.RUNNING);

    const ticked = tickRestTimer(tickRestTimer(tickRestTimer(resumed)));
    expect(ticked.timer.status).toBe(WorkoutTimerStatuses.COMPLETED);
    expect(ticked.timer.remainingSeconds).toBe(0);
  });

  it("finishWorkout marks runtime completed", async () => {
    const runtime = await loadWorkoutRuntime({ service: createService() });
    const withNotes = updateWorkoutSet(runtime, { notes: "solid session" });
    const finished = await finishWorkout(withNotes, {
      service: createService(),
      now: new Date("2026-07-29T11:00:00.000Z"),
    });

    expect(finished.state.status).toBe(WorkoutRuntimeStatuses.COMPLETED);
    expect(finished.finishedAt).toBe("2026-07-29T11:00:00.000Z");
  });

  it("loading status helpers remain idle after load", () => {
    expect(WorkoutLoadingStatuses.LOADING).toBe("loading");
    expect(WorkoutSetStatuses.CURRENT).toBe("current");
  });
});

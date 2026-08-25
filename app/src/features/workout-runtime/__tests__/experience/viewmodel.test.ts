import { WorkoutRuntimeViewModel } from "../../viewmodels";
import { mockWorkoutRuntimeData } from "../../mocks/workoutRuntimeData";
import { WorkoutLoadingStatuses } from "../../models/experience/WorkoutLoadingState";
import { WorkoutRuntimeStatuses } from "../../models/experience/WorkoutRuntimeState";
import { WorkoutTimerStatuses } from "../../models/experience/WorkoutTimer";
import type { WorkoutRuntimeDto } from "../../types/workoutRuntimeDto";
import type { WorkoutRuntimeExperienceService } from "../../types/workoutRuntimeService";
import { WorkoutRuntimeExperienceError } from "../../types/workoutRuntimeService";
import { mockWorkoutRuntimeService } from "../../providers/MockWorkoutRuntimeService";
import { persistWorkoutRuntimeMutation } from "../../../../runtime/domain-persistence/application/persistWorkoutRuntimeMutation";

jest.mock(
  "../../../../runtime/domain-persistence/application/persistWorkoutRuntimeMutation",
  () => ({
    persistWorkoutRuntimeMutation: jest.fn(),
  }),
);

const mockedPersistWorkoutRuntimeMutation =
  persistWorkoutRuntimeMutation as jest.Mock;

function createService(options?: {
  dto?: WorkoutRuntimeDto;
  fail?: boolean;
  failOnce?: boolean;
  empty?: boolean;
}): WorkoutRuntimeExperienceService {
  let calls = 0;
  return {
    providerId: "mock",
    async getRuntime() {
      calls += 1;
      if (options?.fail) {
        throw new WorkoutRuntimeExperienceError("load failed", "mock");
      }
      if (options?.failOnce && calls === 1) {
        throw new WorkoutRuntimeExperienceError("transient", "mock");
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

describe("WorkoutRuntimeViewModel", () => {
  it("loads workout runtime with current exercise and set", async () => {
    const viewModel = new WorkoutRuntimeViewModel({
      service: createService(),
    });

    await viewModel.loadWorkout();

    expect(viewModel.loading.status).toBe(WorkoutLoadingStatuses.IDLE);
    expect(viewModel.error).toBeNull();
    expect(viewModel.runtime?.title).toBe("Upper Body Strength");
    expect(viewModel.currentExercise()?.name).toBe("Barbell Bench Press");
    expect(viewModel.currentSet()?.id).toBe("set-bench-1");
    expect(viewModel.isEmpty).toBe(false);
  });

  it("exposes error state when provider fails", async () => {
    const viewModel = new WorkoutRuntimeViewModel({
      service: createService({ fail: true }),
    });

    await viewModel.loadWorkout();

    expect(viewModel.runtime).toBeNull();
    expect(viewModel.error?.retryable).toBe(true);
    expect(viewModel.error?.message).toContain("load failed");
  });

  it("refresh recovers after a prior error", async () => {
    const viewModel = new WorkoutRuntimeViewModel({
      service: createService({ failOnce: true }),
    });

    await viewModel.loadWorkout();
    expect(viewModel.error).not.toBeNull();

    await viewModel.refresh();
    expect(viewModel.error).toBeNull();
    expect(viewModel.runtime?.title).toBe("Upper Body Strength");
    expect(viewModel.loading.isRefreshing).toBe(false);
  });

  it("completeSet / update values / navigate / timer / finish workflow", async () => {
    const viewModel = new WorkoutRuntimeViewModel({
      service: createService(),
      now: () => new Date("2026-07-29T12:00:00.000Z"),
    });

    await viewModel.loadWorkout();

    viewModel.updateWeight(85);
    viewModel.updateRepetitions(8);
    viewModel.updateRPE(8);
    viewModel.updateNotes("feeling strong");
    viewModel.completeSet();

    expect(viewModel.runtime?.progress.completedSets).toBe(1);
    expect(viewModel.runtime?.timer.status).toBe(WorkoutTimerStatuses.RUNNING);

    viewModel.pauseRestTimer();
    expect(viewModel.runtime?.timer.status).toBe(WorkoutTimerStatuses.PAUSED);
    viewModel.resumeRestTimer();
    expect(viewModel.runtime?.timer.status).toBe(WorkoutTimerStatuses.RUNNING);

    viewModel.nextExercise();
    expect(viewModel.runtime?.currentExerciseIndex).toBe(1);
    viewModel.previousExercise();
    expect(viewModel.runtime?.currentExerciseIndex).toBe(0);
    viewModel.goToExercise(2);
    expect(viewModel.runtime?.currentExerciseIndex).toBe(2);

    viewModel.openFinishDialog();
    expect(viewModel.finishDialogVisible).toBe(true);
    await viewModel.finishWorkout();
    expect(viewModel.finishDialogVisible).toBe(false);
    expect(viewModel.runtime?.state.status).toBe(
      WorkoutRuntimeStatuses.COMPLETED,
    );
    expect(viewModel.runtime?.notes.sessionNotes).toBe("feeling strong");

    await viewModel.finishWorkout();
    expect(viewModel.runtime?.state.status).toBe(
      WorkoutRuntimeStatuses.COMPLETED,
    );
  });

  it("handles empty workout", async () => {
    const viewModel = new WorkoutRuntimeViewModel({
      service: createService({ empty: true }),
    });

    await viewModel.loadWorkout();
    expect(viewModel.isEmpty).toBe(true);
    expect(viewModel.runtime?.state.status).toBe(WorkoutRuntimeStatuses.EMPTY);
  });

  it("does not load from provider when runtime-driven", async () => {
    const viewModel = new WorkoutRuntimeViewModel({ athleteId: "athlete:1" });
    const getRuntimeSpy = jest.spyOn(mockWorkoutRuntimeService, "getRuntime");

    await viewModel.loadWorkout();
    await viewModel.refresh();

    expect(getRuntimeSpy).not.toHaveBeenCalled();
    expect(viewModel.isRuntimeDriven).toBe(true);
  });

  it("does not write-through on every timer tick, but still persists real mutations", async () => {
    const loader = new WorkoutRuntimeViewModel({ service: createService() });
    await loader.loadWorkout();
    loader.completeSet(); // starts the rest timer so ticks are observable

    mockedPersistWorkoutRuntimeMutation.mockClear();

    const viewModel = new WorkoutRuntimeViewModel({ athleteId: "athlete:1" });
    viewModel.applyHydratedWorkout(loader.runtime!);
    mockedPersistWorkoutRuntimeMutation.mockClear();

    viewModel.completeSet();
    expect(mockedPersistWorkoutRuntimeMutation).toHaveBeenCalledTimes(1);
    mockedPersistWorkoutRuntimeMutation.mockClear();

    const listener = jest.fn();
    const unsubscribe = viewModel.subscribe(listener);

    for (let i = 0; i < 30; i += 1) {
      viewModel.tickRestTimer();
    }
    for (let i = 0; i < 30; i += 1) {
      viewModel.tickDuration();
    }

    expect(mockedPersistWorkoutRuntimeMutation).not.toHaveBeenCalled();
    expect(listener).toHaveBeenCalled();

    unsubscribe();

    viewModel.updateNotes("still persists real mutations");
    expect(mockedPersistWorkoutRuntimeMutation).toHaveBeenCalledTimes(1);
  });
});

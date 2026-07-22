import {
  completeSet,
  completeWorkout,
  pauseWorkout,
  resumeWorkout,
  skipExercise,
  startWorkout,
} from "../application";
import { WorkoutRuntimeError } from "../models/WorkoutRuntimeError";
import { createMinimalWorkoutSession } from "../testSupport/fixtures";

const FIXED = "2026-07-22T00:00:00.000Z";

describe("workout-runtime application API", () => {
  it("exposes lifecycle without leaking engine internals", () => {
    const workout = startWorkout(createMinimalWorkoutSession(), {
      fixedTimestamp: FIXED,
      autoCompleteOnLastExerciseSkip: false,
      autoCompleteOnLastSet: false,
    });

    expect(workout.getState()).toBe("Running");
    expect(Object.keys(workout)).not.toContain("engine");

    expect(pauseWorkout(workout).state).toBe("Paused");
    expect(resumeWorkout(workout).state).toBe("Running");

    completeSet(workout, { weight: 100, repetitions: 5 });
    completeSet(workout, { weight: 100, repetitions: 5 });
    skipExercise(workout);

    const result = completeWorkout(workout);
    expect(result.finalState).toBe("Completed");
    expect(result.progress.completedExercises).toBe(1);
    expect(result.progress.skippedExercises).toBe(1);
    expect(workout.isTerminal()).toBe(true);
  });

  it("rejects invalid application operations", () => {
    const workout = startWorkout(createMinimalWorkoutSession(), {
      fixedTimestamp: FIXED,
    });
    pauseWorkout(workout);
    expect(() => completeSet(workout, { repetitions: 5 })).toThrow(
      WorkoutRuntimeError,
    );
  });

  it("returns public summaries only from mutations", () => {
    const workout = startWorkout(createMinimalWorkoutSession(), {
      fixedTimestamp: FIXED,
    });
    const summary = completeSet(workout, { repetitions: 5 });
    expect(summary).toMatchObject({
      runtimeId: expect.any(String),
      sessionId: expect.any(String),
      state: "Running",
      progress: expect.objectContaining({ completedSets: 1 }),
    });
    expect(summary).not.toHaveProperty("exercises");
    expect(summary).not.toHaveProperty("session");
  });
});

import { WorkoutRuntimeEngine } from "../runtime/WorkoutRuntimeEngine";
import { createMinimalWorkoutSession } from "../testSupport/fixtures";

const FIXED = "2026-07-22T00:00:00.000Z";

describe("exercise progression", () => {
  it("skips the current exercise and activates the next", () => {
    const engine = new WorkoutRuntimeEngine();
    engine.start(createMinimalWorkoutSession(), {
      fixedTimestamp: FIXED,
      autoCompleteOnLastExerciseSkip: false,
    });

    const after = engine.skipExercise();
    expect(after.currentExerciseName).toBe("Bench Press");
    expect(after.skippedExerciseCount).toBe(1);
    expect(after.progress.skippedExercises).toBe(1);
    expect(after.progress.skippedSets).toBe(2);

    const snapshot = engine.getSnapshot();
    expect(snapshot.exercises[0]?.state).toBe("Skipped");
    expect(snapshot.exercises[1]?.state).toBe("Active");
  });

  it("tracks completed vs skipped exercises", () => {
    const engine = new WorkoutRuntimeEngine();
    engine.start(createMinimalWorkoutSession(), {
      fixedTimestamp: FIXED,
      autoCompleteOnLastSet: false,
      autoCompleteOnLastExerciseSkip: false,
    });

    engine.completeSet({ repetitions: 5 });
    engine.completeSet({ repetitions: 5 });
    engine.skipExercise();

    const snapshot = engine.getSnapshot();
    expect(snapshot.completedExerciseIds).toHaveLength(1);
    expect(snapshot.skippedExerciseIds).toHaveLength(1);
    expect(snapshot.progress.completedExercises).toBe(1);
    expect(snapshot.progress.skippedExercises).toBe(1);
    expect(snapshot.currentExerciseId).toBeNull();
  });

  it("updates exercise progress percent as sets complete", () => {
    const engine = new WorkoutRuntimeEngine();
    engine.start(createMinimalWorkoutSession(), { fixedTimestamp: FIXED });

    engine.completeSet({ repetitions: 5 });
    const snapshot = engine.getSnapshot();
    expect(snapshot.exercises[0]?.progressPercent).toBe(50);
    expect(snapshot.exercises[0]?.completedSetCount).toBe(1);
  });
});

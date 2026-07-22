import { WorkoutRuntimeEngine } from "../runtime/WorkoutRuntimeEngine";
import { createMinimalWorkoutSession } from "../testSupport/fixtures";

const FIXED = "2026-07-22T00:00:00.000Z";

describe("WorkoutRuntimeEngine lifecycle", () => {
  it("starts a workout from an immutable session", () => {
    const session = createMinimalWorkoutSession();
    const engine = new WorkoutRuntimeEngine();
    const summary = engine.start(session, { fixedTimestamp: FIXED });

    expect(summary.state).toBe("Running");
    expect(summary.sessionId).toBe(session.id);
    expect(summary.currentExerciseName).toBe("Back Squat");
    expect(summary.currentSetIndex).toBe(1);
    expect(summary.startedAt).toBe(FIXED);
    expect(session.exercises[0]?.name).toBe("Back Squat");
  });

  it("pauses and resumes", () => {
    const engine = new WorkoutRuntimeEngine();
    engine.start(createMinimalWorkoutSession(), { fixedTimestamp: FIXED });

    expect(engine.pause().state).toBe("Paused");
    expect(engine.getSnapshot().pausedAt).toBe(FIXED);
    expect(engine.resume().state).toBe("Running");
    expect(engine.getSnapshot().pausedAt).toBeNull();
  });

  it("tracks current exercise and set through completion of first set", () => {
    const engine = new WorkoutRuntimeEngine();
    engine.start(createMinimalWorkoutSession(), { fixedTimestamp: FIXED });

    const after = engine.completeSet({
      weight: 100,
      repetitions: 5,
      rpe: 8,
      rir: 2,
    });

    expect(after.state).toBe("Running");
    expect(after.currentExerciseName).toBe("Back Squat");
    expect(after.currentSetIndex).toBe(2);
    expect(after.progress.completedSets).toBe(1);
    expect(after.progress.completionPercent).toBe(25);
  });

  it("advances to next exercise after all sets complete", () => {
    const engine = new WorkoutRuntimeEngine();
    engine.start(createMinimalWorkoutSession(), {
      fixedTimestamp: FIXED,
      autoCompleteOnLastSet: false,
    });

    engine.completeSet({ repetitions: 5 });
    const afterExercise = engine.completeSet({ repetitions: 5 });

    expect(afterExercise.currentExerciseName).toBe("Bench Press");
    expect(afterExercise.currentSetIndex).toBe(1);
    expect(afterExercise.progress.completedExercises).toBe(1);
    expect(afterExercise.completedExerciseCount).toBe(1);
  });

  it("does not mutate the source WorkoutSession", () => {
    const session = createMinimalWorkoutSession();
    const frozenExercises = session.exercises;
    const engine = new WorkoutRuntimeEngine();
    engine.start(session, { fixedTimestamp: FIXED });
    engine.completeSet({ repetitions: 8 });

    expect(session.exercises).toBe(frozenExercises);
    expect(session.exercises[0]?.sets[0]?.repMin).toBe(5);
  });
});

import { WorkoutRuntimeError } from "../models/WorkoutRuntimeError";
import { WorkoutRuntimeEngine } from "../runtime/WorkoutRuntimeEngine";
import { createMinimalWorkoutSession } from "../testSupport/fixtures";
import { freezeResult } from "../utils";

const FIXED = "2026-07-22T00:00:00.000Z";

describe("workout completion", () => {
  it("auto-completes after the last set when configured", () => {
    const engine = new WorkoutRuntimeEngine();
    engine.start(createMinimalWorkoutSession(), {
      fixedTimestamp: FIXED,
      autoCompleteOnLastSet: true,
    });

    engine.completeSet({ repetitions: 5 });
    engine.completeSet({ repetitions: 5 });
    engine.completeSet({ repetitions: 5 });
    const summary = engine.completeSet({ repetitions: 5 });

    expect(summary.state).toBe("Completed");
    expect(engine.isTerminal()).toBe(true);
    expect(summary.progress.completionPercent).toBe(100);
  });

  it("auto-completes after skipping the last remaining exercise", () => {
    const engine = new WorkoutRuntimeEngine();
    engine.start(createMinimalWorkoutSession(), {
      fixedTimestamp: FIXED,
      autoCompleteOnLastExerciseSkip: true,
    });

    engine.skipExercise();
    const summary = engine.skipExercise();

    expect(summary.state).toBe("Completed");
    expect(summary.progress.skippedExercises).toBe(2);
  });

  it("rejects manual complete while exercises remain", () => {
    const engine = new WorkoutRuntimeEngine();
    engine.start(createMinimalWorkoutSession(), {
      fixedTimestamp: FIXED,
      autoCompleteOnLastSet: false,
    });

    engine.completeSet({ repetitions: 5 });
    expect(() => engine.complete()).toThrow(WorkoutRuntimeError);
  });

  it("freezes a WorkoutResult on finish", () => {
    const engine = new WorkoutRuntimeEngine();
    engine.start(createMinimalWorkoutSession(), {
      fixedTimestamp: FIXED,
      autoCompleteOnLastSet: false,
      autoCompleteOnLastExerciseSkip: false,
    });

    engine.skipExercise();
    engine.skipExercise();
    const result = engine.finish();

    expect(result.finalState).toBe("Completed");
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.summary)).toBe(true);
    expect(result.frozenAt).toBe(FIXED);

    const again = freezeResult(engine.getSnapshot(), FIXED);
    expect(again.runtimeId).toBe(result.runtimeId);
  });
});

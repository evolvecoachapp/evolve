import { WorkoutRuntimeError } from "../models/WorkoutRuntimeError";
import { WorkoutRuntimeEngine } from "../runtime/WorkoutRuntimeEngine";
import { createMinimalWorkoutSession } from "../testSupport/fixtures";

const FIXED = "2026-07-22T00:00:00.000Z";

describe("set progression", () => {
  it("records weight, reps, RPE, RIR, and notes", () => {
    const engine = new WorkoutRuntimeEngine();
    engine.start(createMinimalWorkoutSession(), { fixedTimestamp: FIXED });

    engine.completeSet({
      weight: 140,
      repetitions: 6,
      rpe: 7.5,
      rir: 2,
      notes: ["solid"],
    });

    const set = engine.getSnapshot().exercises[0]?.sets[0];
    expect(set?.state).toBe("Completed");
    expect(set?.completed).toBe(true);
    expect(set?.weight).toBe(140);
    expect(set?.repetitions).toBe(6);
    expect(set?.rpe).toBe(7.5);
    expect(set?.rir).toBe(2);
    expect(set?.notes).toEqual(["solid"]);
  });

  it("rejects set completion while paused", () => {
    const engine = new WorkoutRuntimeEngine();
    engine.start(createMinimalWorkoutSession(), { fixedTimestamp: FIXED });
    engine.pause();

    expect(() => engine.completeSet({ repetitions: 5 })).toThrow(
      WorkoutRuntimeError,
    );
  });

  it("advances current set index after completion", () => {
    const engine = new WorkoutRuntimeEngine();
    engine.start(createMinimalWorkoutSession(), { fixedTimestamp: FIXED });

    expect(engine.getSummary().currentSetIndex).toBe(1);
    engine.completeSet({ repetitions: 5 });
    expect(engine.getSummary().currentSetIndex).toBe(2);

    const snapshot = engine.getSnapshot();
    expect(snapshot.exercises[0]?.sets[0]?.state).toBe("Completed");
    expect(snapshot.exercises[0]?.sets[1]?.state).toBe("Active");
  });
});

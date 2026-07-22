import { createDomainEventSystem } from "../index";
import { WorkoutRuntimeEngine } from "../../../features/workout-runtime/runtime/WorkoutRuntimeEngine";
import { createMinimalWorkoutSession } from "../../../features/workout-runtime/testSupport/fixtures";

const FIXED = "2026-07-22T00:00:00.000Z";

describe("domain events × Workout Runtime integration", () => {
  it("emits workout / exercise / set events on start", () => {
    const system = createDomainEventSystem({ sessionId: "wi-1" });
    const engine = new WorkoutRuntimeEngine(
      undefined,
      undefined,
      undefined,
      system,
    );

    engine.start(createMinimalWorkoutSession(), { fixedTimestamp: FIXED });

    const types = system.getEventStream().events.map((event) => event.type);
    expect(types).toEqual([
      "workout_started",
      "exercise_started",
      "set_started",
    ]);
    expect(system.getEventStream().events.every((event) => Object.isFrozen(event))).toBe(
      true,
    );
  });

  it("emits set/exercise progression events without changing business outcomes", () => {
    const system = createDomainEventSystem({ sessionId: "wi-2" });
    const engine = new WorkoutRuntimeEngine(
      undefined,
      undefined,
      undefined,
      system,
    );
    engine.start(createMinimalWorkoutSession(), {
      fixedTimestamp: FIXED,
      autoCompleteOnLastSet: false,
    });

    const afterFirst = engine.completeSet({ repetitions: 5, weight: 100 });
    expect(afterFirst.currentSetIndex).toBe(2);
    expect(afterFirst.progress.completedSets).toBe(1);

    const types = system
      .getEventStream()
      .events.map((event) => event.type);

    expect(types).toContain("set_completed");
    expect(types).toContain("set_started");
    expect(types.filter((type) => type === "set_completed")).toHaveLength(1);
  });

  it("emits skip and complete lifecycle events", () => {
    const system = createDomainEventSystem({ sessionId: "wi-3" });
    const engine = new WorkoutRuntimeEngine(
      undefined,
      undefined,
      undefined,
      system,
    );
    engine.start(createMinimalWorkoutSession(), {
      fixedTimestamp: FIXED,
      autoCompleteOnLastExerciseSkip: false,
    });

    engine.skipExercise();
    engine.skipExercise();
    engine.complete();

    const types = system.getEventStream().events.map((event) => event.type);
    expect(types).toContain("exercise_skipped");
    expect(types).toContain("workout_completed");
    expect(engine.getState()).toBe("Completed");
  });

  it("emits pause / resume / cancel", () => {
    const system = createDomainEventSystem({ sessionId: "wi-4" });
    const engine = new WorkoutRuntimeEngine(
      undefined,
      undefined,
      undefined,
      system,
    );
    engine.start(createMinimalWorkoutSession(), { fixedTimestamp: FIXED });
    engine.pause();
    engine.resume();
    engine.cancel();

    const types = system.getEventStream().events.map((event) => event.type);
    expect(types).toEqual(
      expect.arrayContaining([
        "workout_paused",
        "workout_resumed",
        "workout_cancelled",
      ]),
    );
  });
});

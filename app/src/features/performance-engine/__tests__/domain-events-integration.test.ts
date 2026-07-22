import { analyzeWorkoutPerformance } from "../application";
import { createDomainEventSystem } from "../../../core/domain-events";
import { WorkoutRuntimeEngine } from "../../workout-runtime/runtime/WorkoutRuntimeEngine";
import { createMinimalWorkoutSession } from "../../workout-runtime/testSupport/fixtures";

const FIXED = "2026-07-22T00:00:00.000Z";

describe("performance-engine × Domain Events integration", () => {
  it("consumes EventStream set_completed payloads for volume", () => {
    const system = createDomainEventSystem({ sessionId: "de-session-1" });
    const engine = new WorkoutRuntimeEngine(
      undefined,
      undefined,
      undefined,
      system,
    );
    engine.start(createMinimalWorkoutSession({ id: "de-session-1" }), {
      fixedTimestamp: FIXED,
      autoCompleteOnLastSet: false,
      autoCompleteOnLastExerciseSkip: false,
    });

    engine.completeSet({ weight: 50, repetitions: 10 });
    engine.completeSet({ weight: 50, repetitions: 10 });
    engine.skipExercise();
    const result = engine.complete();

    const stream = system.getEventStream();
    expect(stream.events.some((event) => event.type === "set_completed")).toBe(
      true,
    );
    expect(stream.events.some((event) => event.type === "exercise_skipped")).toBe(
      true,
    );

    const analysis = analyzeWorkoutPerformance(result, stream, {
      analyzedAt: FIXED,
    });

    expect(analysis.snapshot.metrics.volume.tonnage).toBe(1000);
    expect(analysis.snapshot.context.eventStreamId).toBe(stream.id);
    expect(analysis.snapshot.context.eventCount).toBe(stream.eventCount);
    expect(analysis.snapshot.exercises.some((item) => item.skipped)).toBe(true);
  });

  it("does not mutate the EventStream", () => {
    const system = createDomainEventSystem({ sessionId: "de-session-2" });
    const engine = new WorkoutRuntimeEngine(
      undefined,
      undefined,
      undefined,
      system,
    );
    engine.start(createMinimalWorkoutSession({ id: "de-session-2" }), {
      fixedTimestamp: FIXED,
      autoCompleteOnLastSet: false,
    });
    engine.completeSet({ weight: 100, repetitions: 5 });
    engine.completeSet({ weight: 100, repetitions: 5 });
    engine.completeSet({ weight: 100, repetitions: 5 });
    engine.completeSet({ weight: 100, repetitions: 5 });
    const result = engine.complete();

    const before = system.getEventStream().eventCount;
    analyzeWorkoutPerformance(result, system.getEventStream());
    const after = system.getEventStream().eventCount;

    expect(after).toBe(before);
    expect(Object.isFrozen(system.getEventStream().events[0])).toBe(true);
  });
});

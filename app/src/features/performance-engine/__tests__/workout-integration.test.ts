import {
  analyzeWorkoutPerformance,
} from "../application";
import {
  completeSet,
  completeWorkout,
  startWorkout,
} from "../../workout-runtime/application";
import { WorkoutRuntimeEngine } from "../../workout-runtime/runtime/WorkoutRuntimeEngine";
import { createMinimalWorkoutSession } from "../../workout-runtime/testSupport/fixtures";
import { createDomainEventSystem } from "../../../core/domain-events";

const FIXED = "2026-07-22T00:00:00.000Z";

describe("performance-engine × Workout Runtime integration", () => {
  it("analyzes a live completed workout with domain events", () => {
    const system = createDomainEventSystem({ sessionId: "session-runtime-1" });
    const engine = new WorkoutRuntimeEngine(
      undefined,
      undefined,
      undefined,
      system,
    );
    engine.start(createMinimalWorkoutSession({ id: "session-runtime-1" }), {
      fixedTimestamp: FIXED,
      autoCompleteOnLastSet: false,
    });

    engine.completeSet({ weight: 100, repetitions: 5, rpe: 8, rir: 2 });
    engine.completeSet({ weight: 100, repetitions: 5, rpe: 8, rir: 2 });
    engine.completeSet({ weight: 60, repetitions: 8, rpe: 7, rir: 3 });
    engine.completeSet({ weight: 60, repetitions: 8, rpe: 7, rir: 3 });

    const result = engine.complete();
    const stream = system.getEventStream();
    const analysis = analyzeWorkoutPerformance(result, stream, {
      analyzedAt: FIXED,
    });

    expect(result.finalState).toBe("Completed");
    expect(analysis.snapshot.metrics.volume.tonnage).toBe(1960);
    expect(analysis.snapshot.metrics.volume.totalCompletedSets).toBe(4);
    expect(analysis.snapshot.exercises.length).toBeGreaterThanOrEqual(2);
    expect(analysis.snapshot.grade).toBe("A");
    expect(analysis.snapshot.trend.available).toBe(false);
  });

  it("application completeWorkout result is analyzable via ActiveWorkout events", () => {
    const workout = startWorkout(createMinimalWorkoutSession(), {
      fixedTimestamp: FIXED,
      autoCompleteOnLastSet: false,
    });

    completeSet(workout, { weight: 140, repetitions: 6 });
    completeSet(workout, { weight: 140, repetitions: 6 });
    completeSet(workout, { weight: 80, repetitions: 8 });
    completeSet(workout, { weight: 80, repetitions: 8 });

    const result = completeWorkout(workout);
    const stream = workout.getDomainEventSystem().getEventStream();
    const analysis = analyzeWorkoutPerformance(result, stream);

    expect(analysis.snapshot.metrics.volume.tonnage).toBe(
      140 * 6 * 2 + 80 * 8 * 2,
    );
    expect(analysis.snapshot.session.finalState).toBe("Completed");
  });
});

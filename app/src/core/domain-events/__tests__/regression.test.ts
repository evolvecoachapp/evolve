import { createDomainEventSystem, summarizeEvents } from "../index";
import { WorkoutRuntimeEngine } from "../../../features/workout-runtime/runtime/WorkoutRuntimeEngine";
import { RestRuntimeEngine } from "../../../features/rest-runtime/runtime/RestRuntimeEngine";
import { createMinimalWorkoutSession } from "../../../features/workout-runtime/testSupport/fixtures";
import { createMinimalRestSession } from "../../../features/rest-runtime/testSupport/fixtures";

const FIXED = "2026-07-22T00:00:00.000Z";

describe("domain events regression", () => {
  it("does not alter workout progression outcomes", () => {
    const withEvents = new WorkoutRuntimeEngine(
      undefined,
      undefined,
      undefined,
      createDomainEventSystem({ sessionId: "reg-w1" }),
    );
    const baseline = new WorkoutRuntimeEngine();

    const session = createMinimalWorkoutSession();
    withEvents.start(session, {
      fixedTimestamp: FIXED,
      autoCompleteOnLastSet: false,
    });
    baseline.start(session, {
      fixedTimestamp: FIXED,
      autoCompleteOnLastSet: false,
    });

    const a = withEvents.completeSet({ repetitions: 5 });
    const b = baseline.completeSet({ repetitions: 5 });

    expect(a.state).toBe(b.state);
    expect(a.currentSetIndex).toBe(b.currentSetIndex);
    expect(a.progress.completedSets).toBe(b.progress.completedSets);
    expect(a.progress.completionPercent).toBe(b.progress.completionPercent);
  });

  it("does not alter rest timing outcomes", () => {
    const withEvents = new RestRuntimeEngine(
      undefined,
      createDomainEventSystem({ sessionId: "reg-r1" }),
    );
    const baseline = new RestRuntimeEngine();

    const session = createMinimalRestSession({ targetDurationMs: 60_000 });
    withEvents.start(session, { fixedTimestamp: FIXED });
    baseline.start(session, { fixedTimestamp: FIXED });

    const a = withEvents.updateElapsedTime(20_000);
    const b = baseline.updateElapsedTime(20_000);

    expect(a.state).toBe(b.state);
    expect(a.elapsedMs).toBe(b.elapsedMs);
    expect(a.remainingMs).toBe(b.remainingMs);
    expect(a.progress.completionPercent).toBe(b.progress.completionPercent);
  });

  it("keeps stream summary stable for a fixed lifecycle", () => {
    const system = createDomainEventSystem({ sessionId: "reg-s1" });
    const engine = new WorkoutRuntimeEngine(
      undefined,
      undefined,
      undefined,
      system,
    );
    engine.start(createMinimalWorkoutSession(), { fixedTimestamp: FIXED });
    engine.pause();
    engine.resume();

    const summary = summarizeEvents(system);
    expect(summary.totalEvents).toBe(5);
    expect(summary.byCategory.workout).toBe(3);
    expect(summary.byCategory.exercise).toBe(1);
    expect(summary.byCategory.set).toBe(1);
  });
});

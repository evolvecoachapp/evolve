import {
  createDomainEventSystem,
  DomainEventBuilder,
  EventStreamStore,
  summarizeEvents,
} from "../index";
import {
  createTestContext,
  createWorkoutStartedEvent,
  FIXED_EVENT_TIMESTAMP,
} from "../testSupport/fixtures";

describe("EventStream", () => {
  it("appends and retrieves ordered events", () => {
    const store = new EventStreamStore("stream-1", "session-1");
    store.append(createWorkoutStartedEvent(1));
    store.append(
      new DomainEventBuilder().workoutLifecycle("workout_paused", {
        sequence: 2,
        timestamp: FIXED_EVENT_TIMESTAMP,
        context: createTestContext({ sessionId: "session-1" }),
        payload: {
          workoutRuntimeId: "runtime-1",
          sessionId: "session-1",
          state: "Paused",
        },
      }),
    );

    const stream = store.getStream();
    expect(stream.eventCount).toBe(2);
    expect(stream.events[0]?.type).toBe("workout_started");
    expect(stream.events[1]?.type).toBe("workout_paused");
    expect(Object.isFrozen(stream.events)).toBe(true);
  });

  it("filters by category, source, and type", () => {
    const system = createDomainEventSystem({ sessionId: "stream-2" });
    const builder = new DomainEventBuilder();
    const context = createTestContext({ sessionId: "stream-2" });

    system.publishEvent(
      builder.workoutStarted({
        sequence: 1,
        timestamp: FIXED_EVENT_TIMESTAMP,
        context,
        payload: { workoutRuntimeId: "r1", sessionId: "stream-2" },
      }),
    );
    system.publishEvent(
      builder.restLifecycle("rest_started", {
        sequence: 2,
        timestamp: FIXED_EVENT_TIMESTAMP,
        context,
        payload: {
          restRuntimeId: "rest-1",
          sessionId: "stream-2",
          workoutRuntimeId: "r1",
          elapsedMs: 0,
          targetDurationMs: 90_000,
          state: "Running",
        },
      }),
    );

    expect(system.filterByCategory("workout")).toHaveLength(1);
    expect(system.filterByCategory("rest")).toHaveLength(1);
    expect(system.filterBySource("rest-runtime")).toHaveLength(1);
    expect(system.filterByType("rest_started")).toHaveLength(1);
  });

  it("summarizes the stream through the public API", () => {
    const system = createDomainEventSystem({ sessionId: "stream-3" });
    system.publishEvent(createWorkoutStartedEvent(1));

    const summary = summarizeEvents(system);
    expect(summary.totalEvents).toBe(1);
    expect(summary.byType.workout_started).toBe(1);
    expect(summary.summaryText).toContain("1 domain events");
  });
});

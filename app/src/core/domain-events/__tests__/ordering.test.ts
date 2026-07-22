import {
  createDomainEventSystem,
  DomainEventBuilder,
  DomainEventError,
  validateDuplicateSequence,
  validateEventOrdering,
} from "../index";
import {
  createTestContext,
  createWorkoutStartedEvent,
  FIXED_EVENT_TIMESTAMP,
} from "../testSupport/fixtures";

describe("domain event ordering", () => {
  it("maintains deterministic sequence order in the stream", () => {
    const system = createDomainEventSystem({ sessionId: "ord-1" });
    const builder = new DomainEventBuilder();
    const context = createTestContext();

    system.publishEvent(createWorkoutStartedEvent(1));
    system.publishEvent(
      builder.workoutLifecycle("workout_paused", {
        sequence: 2,
        timestamp: FIXED_EVENT_TIMESTAMP,
        context,
        payload: {
          workoutRuntimeId: "runtime-1",
          sessionId: "session-events-1",
          state: "Paused",
        },
      }),
    );
    system.publishEvent(
      builder.workoutLifecycle("workout_resumed", {
        sequence: 3,
        timestamp: FIXED_EVENT_TIMESTAMP,
        context,
        payload: {
          workoutRuntimeId: "runtime-1",
          sessionId: "session-events-1",
          state: "Running",
        },
      }),
    );

    const events = system.getEventStream().events;
    expect(events.map((event) => event.sequence)).toEqual([1, 2, 3]);
    expect(validateEventOrdering(events)).toEqual([]);
    expect(validateDuplicateSequence(events)).toEqual([]);
  });

  it("rejects duplicate sequences on append", () => {
    const system = createDomainEventSystem({ sessionId: "ord-2" });
    system.publishEvent(createWorkoutStartedEvent(1));

    expect(() =>
      system.publishEvent(createWorkoutStartedEvent(1)),
    ).toThrow(DomainEventError);
  });

  it("rejects out-of-order sequences", () => {
    const system = createDomainEventSystem({ sessionId: "ord-3" });
    system.publishEvent(createWorkoutStartedEvent(1));

    expect(() =>
      system.publishEvent(createWorkoutStartedEvent(3)),
    ).toThrow(DomainEventError);
  });
});

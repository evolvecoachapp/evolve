import {
  createDomainEventSystem,
  DomainEventBuilder,
  DomainEventError,
  type DomainEventSubscriber,
} from "../index";
import {
  createTestContext,
  createWorkoutStartedEvent,
  FIXED_EVENT_TIMESTAMP,
} from "../testSupport/fixtures";

describe("DomainEventDispatcher", () => {
  it("publishes events synchronously to subscribers in order", () => {
    const system = createDomainEventSystem({ sessionId: "disp-1" });
    const seen: string[] = [];

    const first: DomainEventSubscriber = {
      id: "sub-1",
      name: "First",
      onEvent: (event) => {
        seen.push(`first:${event.type}`);
      },
    };
    const second: DomainEventSubscriber = {
      id: "sub-2",
      name: "Second",
      onEvent: (event) => {
        seen.push(`second:${event.type}`);
      },
    };

    system.subscribe(first);
    system.subscribe(second);

    system.publishEvent(createWorkoutStartedEvent(1));

    expect(seen).toEqual(["first:workout_started", "second:workout_started"]);
    expect(system.getEventStream().eventCount).toBe(1);
  });

  it("prevents mutation of published events", () => {
    const system = createDomainEventSystem({ sessionId: "disp-2" });
    const published = system.publishEvent(createWorkoutStartedEvent(1));

    expect(Object.isFrozen(published)).toBe(true);
    expect(Object.isFrozen(published.payload)).toBe(true);
    expect(Object.isFrozen(published.metadata)).toBe(true);
    expect(Object.isFrozen(published.context)).toBe(true);

    const originalMessage = published.message;
    try {
      (published as { message: string }).message = "mutated";
    } catch {
      // strict-mode environments throw on frozen assignment
    }
    expect(published.message).toBe(originalMessage);
  });

  it("unsubscribes and rejects unknown subscriber ids", () => {
    const system = createDomainEventSystem({ sessionId: "disp-3" });
    const seen: string[] = [];
    const subscriber: DomainEventSubscriber = {
      id: "sub-x",
      name: "X",
      onEvent: (event) => seen.push(event.type),
    };

    const unsubscribe = system.subscribe(subscriber);
    system.publishEvent(createWorkoutStartedEvent(1));
    unsubscribe();
    system.publishEvent(
      new DomainEventBuilder().workoutLifecycle("workout_paused", {
        sequence: 2,
        timestamp: FIXED_EVENT_TIMESTAMP,
        context: createTestContext(),
        payload: {
          workoutRuntimeId: "runtime-1",
          sessionId: "session-events-1",
          state: "Paused",
        },
      }),
    );

    expect(seen).toEqual(["workout_started"]);
    expect(() => system.unsubscribe("missing")).toThrow(DomainEventError);
  });

  it("rejects invalid events before append", () => {
    const system = createDomainEventSystem({ sessionId: "disp-4" });
    const invalid = {
      ...createWorkoutStartedEvent(1),
      context: undefined,
    };

    expect(() =>
      system.publishEvent(invalid as unknown as ReturnType<typeof createWorkoutStartedEvent>),
    ).toThrow(DomainEventError);
    expect(system.getEventStream().eventCount).toBe(0);
  });
});

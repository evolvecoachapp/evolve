import {
  DomainEventBuilder,
  validateDuplicateSequence,
  validateEvent,
  validateEventOrdering,
  validateEventStream,
  validateImmutablePayload,
  validateTimestamps,
} from "../index";
import {
  createTestContext,
  createWorkoutStartedEvent,
  FIXED_EVENT_TIMESTAMP,
} from "../testSupport/fixtures";

describe("domain event validators", () => {
  it("accepts a valid frozen event", () => {
    const event = createWorkoutStartedEvent(1);
    expect(validateEvent(event)).toEqual([]);
    expect(validateImmutablePayload(event)).toEqual([]);
  });

  it("detects missing metadata and context", () => {
    const event = createWorkoutStartedEvent(1);
    const missingMeta = {
      ...event,
      metadata: undefined,
    };
    const missingContext = {
      ...event,
      context: undefined,
    };

    expect(
      validateEvent(missingMeta as unknown as typeof event).some((issue) =>
        issue.startsWith("missing_metadata"),
      ),
    ).toBe(true);
    expect(
      validateEvent(missingContext as unknown as typeof event).some((issue) =>
        issue.startsWith("missing_context"),
      ),
    ).toBe(true);
  });

  it("detects invalid timestamps and ordering issues", () => {
    const builder = new DomainEventBuilder();
    const context = createTestContext();

    const badTs = builder.workoutStarted({
      sequence: 1,
      timestamp: "not-a-timestamp",
      context,
      payload: { workoutRuntimeId: "r1", sessionId: "s1" },
    });
    expect(validateTimestamps([badTs]).length).toBeGreaterThan(0);

    const events = [
      createWorkoutStartedEvent(1),
      builder.workoutLifecycle("workout_paused", {
        sequence: 1,
        timestamp: FIXED_EVENT_TIMESTAMP,
        context,
        payload: {
          workoutRuntimeId: "runtime-1",
          sessionId: "session-events-1",
          state: "Paused",
        },
      }),
    ];

    expect(validateDuplicateSequence(events).length).toBeGreaterThan(0);
    expect(validateEventOrdering(events).length).toBeGreaterThan(0);
  });

  it("detects mutable payloads", () => {
    const event = createWorkoutStartedEvent(1);
    const mutable = {
      ...event,
      payload: { ...event.payload },
    };

    expect(
      validateImmutablePayload(mutable as typeof event).some((issue) =>
        issue.includes("mutable_payload"),
      ),
    ).toBe(true);
  });

  it("validates a full stream", () => {
    const stream = [
      createWorkoutStartedEvent(1),
      new DomainEventBuilder().workoutLifecycle("workout_completed", {
        sequence: 2,
        timestamp: FIXED_EVENT_TIMESTAMP,
        context: createTestContext(),
        payload: {
          workoutRuntimeId: "runtime-1",
          sessionId: "session-events-1",
          state: "Completed",
        },
      }),
    ];

    expect(validateEventStream(stream)).toEqual([]);
  });
});

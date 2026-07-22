import {
  DomainEventBuilder,
  EventContextBuilder,
  EventMetadataBuilder,
} from "../index";
import { FIXED_EVENT_TIMESTAMP } from "../testSupport/fixtures";

describe("domain event builders", () => {
  it("builds immutable context and metadata", () => {
    const context = new EventContextBuilder()
      .withSessionId("session-b1")
      .withWorkoutRuntimeId("runtime-b1")
      .withExerciseRuntimeId("ex-1")
      .build();

    const metadata = new EventMetadataBuilder()
      .withTag("lifecycle")
      .withAttribute("phase", "start")
      .build();

    expect(Object.isFrozen(context)).toBe(true);
    expect(Object.isFrozen(metadata)).toBe(true);
    expect(Object.isFrozen(metadata.tags)).toBe(true);
    expect(metadata.tags).toEqual(["lifecycle"]);
    expect(metadata.attributes.phase).toBe("start");
  });

  it("builds typed workout / rest domain events", () => {
    const builder = new DomainEventBuilder();
    const context = new EventContextBuilder()
      .withSessionId("session-b2")
      .withWorkoutRuntimeId("runtime-b2")
      .build();

    const started = builder.workoutStarted({
      sequence: 1,
      timestamp: FIXED_EVENT_TIMESTAMP,
      context,
      payload: {
        workoutRuntimeId: "runtime-b2",
        sessionId: "session-b2",
      },
      metadata: { tags: ["start"], attributes: {} },
    });

    const rest = builder.restLifecycle("rest_completed", {
      sequence: 2,
      timestamp: FIXED_EVENT_TIMESTAMP,
      context,
      payload: {
        restRuntimeId: "rest-b2",
        sessionId: "session-b2",
        workoutRuntimeId: "runtime-b2",
        elapsedMs: 90_000,
        targetDurationMs: 90_000,
        state: "Completed",
      },
    });

    expect(started.type).toBe("workout_started");
    expect(started.category).toBe("workout");
    expect(started.source).toBe("workout-runtime");
    expect(Object.isFrozen(started)).toBe(true);

    expect(rest.type).toBe("rest_completed");
    expect(rest.category).toBe("rest");
    expect(rest.source).toBe("rest-runtime");
  });
});

import { validateWorkoutProgressEvent } from "../validation/validateWorkoutProgressEvent";
import { WorkoutProgressValidationError } from "../validation/WorkoutProgressValidationError";
import { createTestWorkoutProgressEvent } from "../testSupport/fixtures";

describe("workout-progress validation", () => {
  it("accepts valid events", () => {
    expect(() =>
      validateWorkoutProgressEvent({ event: createTestWorkoutProgressEvent() }),
    ).not.toThrow();
  });

  it("rejects missing event", () => {
    expect(() => validateWorkoutProgressEvent({ event: null })).toThrow(
      WorkoutProgressValidationError,
    );
  });

  it("rejects duplicate event id", () => {
    expect(() =>
      validateWorkoutProgressEvent({
        event: createTestWorkoutProgressEvent(),
        publishedEventIds: ["evt-001"],
      }),
    ).toThrow(
      expect.objectContaining({ code: "duplicate_event_id" }),
    );
  });

  it("rejects unsupported event type", () => {
    expect(() =>
      validateWorkoutProgressEvent({
        event: createTestWorkoutProgressEvent({
          type: "Unsupported" as never,
        }),
      }),
    ).toThrow(
      expect.objectContaining({ code: "unsupported_event_type" }),
    );
  });

  it("rejects missing metadata", () => {
    const event = createTestWorkoutProgressEvent({
      metadata: {
        source: "workout",
        correlationId: "",
        sessionId: "session-001",
        workoutId: null,
        athleteId: null,
        publishedAt: "",
      },
    });

    expect(() => validateWorkoutProgressEvent({ event })).toThrow(
      expect.objectContaining({ code: "missing_metadata" }),
    );
  });

  it("rejects invalid payload session mismatch", () => {
    const event = createTestWorkoutProgressEvent({
      payload: Object.freeze({
        ...createTestWorkoutProgressEvent().payload,
        sessionId: "other-session",
      }),
    });

    expect(() => validateWorkoutProgressEvent({ event })).toThrow(
      expect.objectContaining({ code: "invalid_payload" }),
    );
  });
});

import { validateGoalProgressEvent } from "../validation/validateGoalProgressEvent";
import { GoalProgressValidationError } from "../validation/GoalProgressValidationError";
import { createTestGoalProgressEvent } from "../testSupport/fixtures";

describe("goal-progress validation", () => {
  it("accepts valid events", () => {
    expect(() =>
      validateGoalProgressEvent({ event: createTestGoalProgressEvent() }),
    ).not.toThrow();
  });

  it("rejects missing event", () => {
    expect(() => validateGoalProgressEvent({ event: null })).toThrow(
      GoalProgressValidationError,
    );
  });

  it("rejects duplicate event id", () => {
    expect(() =>
      validateGoalProgressEvent({
        event: createTestGoalProgressEvent(),
        publishedEventIds: ["evt-001"],
      }),
    ).toThrow(
      expect.objectContaining({ code: "duplicate_event_id" }),
    );
  });

  it("rejects unsupported event type", () => {
    expect(() =>
      validateGoalProgressEvent({
        event: createTestGoalProgressEvent({
          type: "Unsupported" as never,
        }),
      }),
    ).toThrow(
      expect.objectContaining({ code: "unsupported_event_type" }),
    );
  });

  it("rejects missing metadata", () => {
    const event = createTestGoalProgressEvent({
      metadata: {
        source: "goal",
        correlationId: "",
        goalId: "goal-001",
        snapshotId: null,
        athleteId: null,
        publishedAt: "",
      },
    });

    expect(() => validateGoalProgressEvent({ event })).toThrow(
      expect.objectContaining({ code: "missing_metadata" }),
    );
  });

  it("rejects invalid payload goal mismatch", () => {
    const event = createTestGoalProgressEvent({
      payload: Object.freeze({
        ...createTestGoalProgressEvent().payload,
        goalId: "other-goal",
      }),
    });

    expect(() => validateGoalProgressEvent({ event })).toThrow(
      expect.objectContaining({ code: "invalid_payload" }),
    );
  });
});

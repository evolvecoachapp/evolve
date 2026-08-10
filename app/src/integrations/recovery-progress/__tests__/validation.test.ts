import { validateRecoveryProgressEvent } from "../validation/validateRecoveryProgressEvent";
import { RecoveryProgressValidationError } from "../validation/RecoveryProgressValidationError";
import { createTestRecoveryProgressEvent } from "../testSupport/fixtures";

describe("recovery-progress validation", () => {
  it("accepts valid events", () => {
    expect(() =>
      validateRecoveryProgressEvent({ event: createTestRecoveryProgressEvent() }),
    ).not.toThrow();
  });

  it("rejects missing event", () => {
    expect(() => validateRecoveryProgressEvent({ event: null })).toThrow(
      RecoveryProgressValidationError,
    );
  });

  it("rejects duplicate event id", () => {
    expect(() =>
      validateRecoveryProgressEvent({
        event: createTestRecoveryProgressEvent(),
        publishedEventIds: ["evt-001"],
      }),
    ).toThrow(
      expect.objectContaining({ code: "duplicate_event_id" }),
    );
  });

  it("rejects unsupported event type", () => {
    expect(() =>
      validateRecoveryProgressEvent({
        event: createTestRecoveryProgressEvent({
          type: "Unsupported" as never,
        }),
      }),
    ).toThrow(
      expect.objectContaining({ code: "unsupported_event_type" }),
    );
  });

  it("rejects missing metadata", () => {
    const event = createTestRecoveryProgressEvent({
      metadata: {
        source: "recovery",
        correlationId: "",
        dayId: "2026-08-02",
        assessmentId: null,
        athleteId: null,
        publishedAt: "",
      },
    });

    expect(() => validateRecoveryProgressEvent({ event })).toThrow(
      expect.objectContaining({ code: "missing_metadata" }),
    );
  });

  it("rejects invalid payload day mismatch", () => {
    const event = createTestRecoveryProgressEvent({
      payload: Object.freeze({
        ...createTestRecoveryProgressEvent().payload,
        dayId: "other-day",
      }),
    });

    expect(() => validateRecoveryProgressEvent({ event })).toThrow(
      expect.objectContaining({ code: "invalid_payload" }),
    );
  });
});

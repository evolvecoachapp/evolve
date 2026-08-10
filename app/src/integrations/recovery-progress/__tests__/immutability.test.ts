import {
  createRecoveryProgressEvent,
  createRecoveryProgressMetadata,
  createRecoveryProgressResult,
  createRecoveryProgressSnapshot,
} from "../models";
import { createTestRecoveryProgressEvent } from "../testSupport/fixtures";

describe("recovery-progress immutability", () => {
  it("freezes integration models", () => {
    const event = createTestRecoveryProgressEvent();
    expect(Object.isFrozen(event)).toBe(true);
    expect(Object.isFrozen(event.metadata)).toBe(true);
    expect(Object.isFrozen(event.payload)).toBe(true);
    expect(Object.isFrozen(event.payload.metrics)).toBe(true);
  });

  it("freezes factory outputs", () => {
    const metadata = createRecoveryProgressMetadata({
      source: "recovery",
      correlationId: "corr",
      dayId: "2026-08-02",
      assessmentId: null,
      athleteId: null,
      publishedAt: "2026-08-02T20:00:00.000Z",
    });
    const snapshot = createRecoveryProgressSnapshot({
      publishedEventCount: 1,
      lastEventId: "evt",
      lastEventType: "RecoveryDayStarted",
      capturedAt: "2026-08-02T20:00:00.000Z",
    });
    const result = createRecoveryProgressResult({
      eventId: "evt",
      accepted: true,
      publishedAt: "2026-08-02T20:00:00.000Z",
      subscriberResults: [],
    });

    expect(Object.isFrozen(metadata)).toBe(true);
    expect(Object.isFrozen(snapshot)).toBe(true);
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(createRecoveryProgressEvent(createTestRecoveryProgressEvent()))).toBe(true);
  });
});

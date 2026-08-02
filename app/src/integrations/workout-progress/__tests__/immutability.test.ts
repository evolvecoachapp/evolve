import {
  createWorkoutProgressEvent,
  createWorkoutProgressMetadata,
  createWorkoutProgressResult,
  createWorkoutProgressSnapshot,
} from "../models";
import { createTestWorkoutProgressEvent } from "../testSupport/fixtures";

describe("workout-progress immutability", () => {
  it("freezes integration models", () => {
    const event = createTestWorkoutProgressEvent();
    expect(Object.isFrozen(event)).toBe(true);
    expect(Object.isFrozen(event.metadata)).toBe(true);
    expect(Object.isFrozen(event.payload)).toBe(true);
    expect(Object.isFrozen(event.payload.metrics)).toBe(true);
  });

  it("freezes factory outputs", () => {
    const metadata = createWorkoutProgressMetadata({
      source: "workout",
      correlationId: "corr",
      sessionId: "session",
      workoutId: null,
      athleteId: null,
      publishedAt: "2026-08-02T20:00:00.000Z",
    });
    const snapshot = createWorkoutProgressSnapshot({
      publishedEventCount: 1,
      lastEventId: "evt",
      lastEventType: "WorkoutStarted",
      capturedAt: "2026-08-02T20:00:00.000Z",
    });
    const result = createWorkoutProgressResult({
      eventId: "evt",
      accepted: true,
      publishedAt: "2026-08-02T20:00:00.000Z",
      subscriberResults: [],
    });

    expect(Object.isFrozen(metadata)).toBe(true);
    expect(Object.isFrozen(snapshot)).toBe(true);
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(createWorkoutProgressEvent(createTestWorkoutProgressEvent()))).toBe(true);
  });
});

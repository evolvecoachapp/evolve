import {
  createGoalProgressEvent,
  createGoalProgressMetadata,
  createGoalProgressResult,
  createGoalProgressSnapshot,
} from "../models";
import { createTestGoalProgressEvent } from "../testSupport/fixtures";

describe("goal-progress immutability", () => {
  it("freezes integration models", () => {
    const event = createTestGoalProgressEvent();
    expect(Object.isFrozen(event)).toBe(true);
    expect(Object.isFrozen(event.metadata)).toBe(true);
    expect(Object.isFrozen(event.payload)).toBe(true);
    expect(Object.isFrozen(event.payload.metrics)).toBe(true);
  });

  it("freezes factory outputs", () => {
    const metadata = createGoalProgressMetadata({
      source: "goal",
      correlationId: "corr",
      goalId: "goal-001",
      snapshotId: null,
      athleteId: null,
      publishedAt: "2026-08-02T20:00:00.000Z",
    });
    const snapshot = createGoalProgressSnapshot({
      publishedEventCount: 1,
      lastEventId: "evt",
      lastEventType: "GoalTrackingStarted",
      capturedAt: "2026-08-02T20:00:00.000Z",
    });
    const result = createGoalProgressResult({
      eventId: "evt",
      accepted: true,
      publishedAt: "2026-08-02T20:00:00.000Z",
      subscriberResults: [],
    });

    expect(Object.isFrozen(metadata)).toBe(true);
    expect(Object.isFrozen(snapshot)).toBe(true);
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(createGoalProgressEvent(createTestGoalProgressEvent()))).toBe(true);
  });
});

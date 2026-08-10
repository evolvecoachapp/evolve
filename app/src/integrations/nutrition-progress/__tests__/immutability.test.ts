import {
  createNutritionProgressEvent,
  createNutritionProgressMetadata,
  createNutritionProgressResult,
  createNutritionProgressSnapshot,
} from "../models";
import { createTestNutritionProgressEvent } from "../testSupport/fixtures";

describe("nutrition-progress immutability", () => {
  it("freezes integration models", () => {
    const event = createTestNutritionProgressEvent();
    expect(Object.isFrozen(event)).toBe(true);
    expect(Object.isFrozen(event.metadata)).toBe(true);
    expect(Object.isFrozen(event.payload)).toBe(true);
    expect(Object.isFrozen(event.payload.metrics)).toBe(true);
  });

  it("freezes factory outputs", () => {
    const metadata = createNutritionProgressMetadata({
      source: "nutrition",
      correlationId: "corr",
      dayId: "2026-08-02",
      mealPlanId: null,
      athleteId: null,
      publishedAt: "2026-08-02T20:00:00.000Z",
    });
    const snapshot = createNutritionProgressSnapshot({
      publishedEventCount: 1,
      lastEventId: "evt",
      lastEventType: "NutritionDayStarted",
      capturedAt: "2026-08-02T20:00:00.000Z",
    });
    const result = createNutritionProgressResult({
      eventId: "evt",
      accepted: true,
      publishedAt: "2026-08-02T20:00:00.000Z",
      subscriberResults: [],
    });

    expect(Object.isFrozen(metadata)).toBe(true);
    expect(Object.isFrozen(snapshot)).toBe(true);
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(createNutritionProgressEvent(createTestNutritionProgressEvent()))).toBe(true);
  });
});

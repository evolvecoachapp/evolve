import { validateNutritionProgressEvent } from "../validation/validateNutritionProgressEvent";
import { NutritionProgressValidationError } from "../validation/NutritionProgressValidationError";
import { createTestNutritionProgressEvent } from "../testSupport/fixtures";

describe("nutrition-progress validation", () => {
  it("accepts valid events", () => {
    expect(() =>
      validateNutritionProgressEvent({ event: createTestNutritionProgressEvent() }),
    ).not.toThrow();
  });

  it("rejects missing event", () => {
    expect(() => validateNutritionProgressEvent({ event: null })).toThrow(
      NutritionProgressValidationError,
    );
  });

  it("rejects duplicate event id", () => {
    expect(() =>
      validateNutritionProgressEvent({
        event: createTestNutritionProgressEvent(),
        publishedEventIds: ["evt-001"],
      }),
    ).toThrow(
      expect.objectContaining({ code: "duplicate_event_id" }),
    );
  });

  it("rejects unsupported event type", () => {
    expect(() =>
      validateNutritionProgressEvent({
        event: createTestNutritionProgressEvent({
          type: "Unsupported" as never,
        }),
      }),
    ).toThrow(
      expect.objectContaining({ code: "unsupported_event_type" }),
    );
  });

  it("rejects missing metadata", () => {
    const event = createTestNutritionProgressEvent({
      metadata: {
        source: "nutrition",
        correlationId: "",
        dayId: "2026-08-02",
        mealPlanId: null,
        athleteId: null,
        publishedAt: "",
      },
    });

    expect(() => validateNutritionProgressEvent({ event })).toThrow(
      expect.objectContaining({ code: "missing_metadata" }),
    );
  });

  it("rejects invalid payload day mismatch", () => {
    const event = createTestNutritionProgressEvent({
      payload: Object.freeze({
        ...createTestNutritionProgressEvent().payload,
        dayId: "other-day",
      }),
    });

    expect(() => validateNutritionProgressEvent({ event })).toThrow(
      expect.objectContaining({ code: "invalid_payload" }),
    );
  });
});

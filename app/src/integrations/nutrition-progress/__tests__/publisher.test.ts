import { NutritionProgressPublisherImpl } from "../publishers";
import { createTestNutritionProgressEvent } from "../testSupport/fixtures";
import { NutritionProgressValidationError } from "../validation";

describe("NutritionProgressPublisher", () => {
  it("publishes immutable events and tracks ids", async () => {
    const publisher = new NutritionProgressPublisherImpl([]);
    const event = createTestNutritionProgressEvent();

    const result = await publisher.publish(event);

    expect(Object.isFrozen(result)).toBe(true);
    expect(result.accepted).toBe(true);
    expect(publisher.getPublishedEventIds()).toEqual(["evt-001"]);
  });

  it("rejects duplicate event ids", async () => {
    const publisher = new NutritionProgressPublisherImpl([]);
    const event = createTestNutritionProgressEvent();

    await publisher.publish(event);

    await expect(publisher.publish(event)).rejects.toMatchObject({
      code: "duplicate_event_id",
    });
  });

  it("rejects missing events", async () => {
    const publisher = new NutritionProgressPublisherImpl([]);

    await expect(
      publisher.publish(null as unknown as ReturnType<typeof createTestNutritionProgressEvent>),
    ).rejects.toBeInstanceOf(NutritionProgressValidationError);
  });
});

import { WorkoutProgressPublisherImpl } from "../publishers";
import { createTestWorkoutProgressEvent } from "../testSupport/fixtures";
import { WorkoutProgressValidationError } from "../validation";

describe("WorkoutProgressPublisher", () => {
  it("publishes immutable events and tracks ids", async () => {
    const publisher = new WorkoutProgressPublisherImpl([]);
    const event = createTestWorkoutProgressEvent();

    const result = await publisher.publish(event);

    expect(Object.isFrozen(result)).toBe(true);
    expect(result.accepted).toBe(true);
    expect(publisher.getPublishedEventIds()).toEqual(["evt-001"]);
  });

  it("rejects duplicate event ids", async () => {
    const publisher = new WorkoutProgressPublisherImpl([]);
    const event = createTestWorkoutProgressEvent();

    await publisher.publish(event);

    await expect(publisher.publish(event)).rejects.toMatchObject({
      code: "duplicate_event_id",
    });
  });

  it("rejects missing events", async () => {
    const publisher = new WorkoutProgressPublisherImpl([]);

    await expect(
      publisher.publish(null as unknown as ReturnType<typeof createTestWorkoutProgressEvent>),
    ).rejects.toBeInstanceOf(WorkoutProgressValidationError);
  });
});

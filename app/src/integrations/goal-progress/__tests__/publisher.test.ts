import { GoalProgressPublisherImpl } from "../publishers";
import { createTestGoalProgressEvent } from "../testSupport/fixtures";
import { GoalProgressValidationError } from "../validation";

describe("GoalProgressPublisher", () => {
  it("publishes immutable events and tracks ids", async () => {
    const publisher = new GoalProgressPublisherImpl([]);
    const event = createTestGoalProgressEvent();

    const result = await publisher.publish(event);

    expect(Object.isFrozen(result)).toBe(true);
    expect(result.accepted).toBe(true);
    expect(publisher.getPublishedEventIds()).toEqual(["evt-001"]);
  });

  it("rejects duplicate event ids", async () => {
    const publisher = new GoalProgressPublisherImpl([]);
    const event = createTestGoalProgressEvent();

    await publisher.publish(event);

    await expect(publisher.publish(event)).rejects.toMatchObject({
      code: "duplicate_event_id",
    });
  });

  it("rejects missing events", async () => {
    const publisher = new GoalProgressPublisherImpl([]);

    await expect(
      publisher.publish(null as unknown as ReturnType<typeof createTestGoalProgressEvent>),
    ).rejects.toBeInstanceOf(GoalProgressValidationError);
  });
});

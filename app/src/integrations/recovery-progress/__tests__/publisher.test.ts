import { RecoveryProgressPublisherImpl } from "../publishers";
import { createTestRecoveryProgressEvent } from "../testSupport/fixtures";
import { RecoveryProgressValidationError } from "../validation";

describe("RecoveryProgressPublisher", () => {
  it("publishes immutable events and tracks ids", async () => {
    const publisher = new RecoveryProgressPublisherImpl([]);
    const event = createTestRecoveryProgressEvent();

    const result = await publisher.publish(event);

    expect(Object.isFrozen(result)).toBe(true);
    expect(result.accepted).toBe(true);
    expect(publisher.getPublishedEventIds()).toEqual(["evt-001"]);
  });

  it("rejects duplicate event ids", async () => {
    const publisher = new RecoveryProgressPublisherImpl([]);
    const event = createTestRecoveryProgressEvent();

    await publisher.publish(event);

    await expect(publisher.publish(event)).rejects.toMatchObject({
      code: "duplicate_event_id",
    });
  });

  it("rejects missing events", async () => {
    const publisher = new RecoveryProgressPublisherImpl([]);

    await expect(
      publisher.publish(null as unknown as ReturnType<typeof createTestRecoveryProgressEvent>),
    ).rejects.toBeInstanceOf(RecoveryProgressValidationError);
  });
});

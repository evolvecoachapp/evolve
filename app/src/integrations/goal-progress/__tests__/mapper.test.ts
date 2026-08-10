import { mapPayloadToProgressAnalyticsDto } from "../mappers/mapPayloadToProgressAnalyticsDto";
import {
  mapGoalMilestoneToReachedPayload,
  mapGoalProgressToUpdatedPayload,
  mapGoalSnapshotToCompletedPayload,
} from "../mappers/mapGoalDomainToAnalyticsPayload";
import {
  createTestGoalMilestone,
  createTestGoalProgressDomain,
  createTestGoalProgressEvent,
  createTestGoalSnapshot,
} from "../testSupport/fixtures";

describe("goal-progress mappers", () => {
  it("maps goal progress to updated payload", () => {
    const payload = mapGoalProgressToUpdatedPayload(
      createTestGoalProgressDomain(),
      "goal-001",
    );
    expect(Object.isFrozen(payload)).toBe(true);
    expect(payload.goalId).toBe("goal-001");
    expect(payload.completionPercent).toBe(75);
  });

  it("maps goal milestone to reached payload", () => {
    const payload = mapGoalMilestoneToReachedPayload(
      createTestGoalMilestone(),
      "goal-001",
    );
    expect(payload.title).toBe("milestone-001");
    expect(payload.category).toBe("performance");
  });

  it("maps goal snapshot to completed payload", () => {
    const payload = mapGoalSnapshotToCompletedPayload(
      createTestGoalSnapshot(),
      "goal-001",
    );
    expect(payload.snapshotId).toBe("snapshot-001");
    expect(payload.status).toBe("completed");
  });

  it("maps integration event to progress analytics DTO", () => {
    const dto = mapPayloadToProgressAnalyticsDto(createTestGoalProgressEvent());
    expect(Object.isFrozen(dto)).toBe(true);
    expect(dto.eventId).toBe("evt-001");
    expect(dto.metadata.source).toBe("goal");
    expect(Object.isFrozen(dto.payload.metrics)).toBe(true);
  });
});

import { mapPayloadToProgressAnalyticsDto } from "../mappers/mapPayloadToProgressAnalyticsDto";
import {
  mapWorkoutPersonalRecordToPayload,
  mapWorkoutSessionSummaryToCompletionPayload,
  mapWorkoutSessionToStartedPayload,
} from "../mappers/mapWorkoutDomainToAnalyticsPayload";
import {
  createTestPersonalRecord,
  createTestWorkoutSession,
  createTestWorkoutSessionSummary,
  createTestWorkoutProgressEvent,
} from "../testSupport/fixtures";

describe("workout-progress mappers", () => {
  it("maps workout session to started payload", () => {
    const payload = mapWorkoutSessionToStartedPayload(createTestWorkoutSession());
    expect(Object.isFrozen(payload)).toBe(true);
    expect(payload.sessionId).toBe("session-001");
    expect(payload.workoutTitle).toBe("Upper Strength");
  });

  it("maps workout summary to completion payload", () => {
    const payload = mapWorkoutSessionSummaryToCompletionPayload(
      createTestWorkoutSessionSummary(),
    );
    expect(payload.volumeKg).toBe(8450);
    expect(payload.durationMinutes).toBe(62);
  });

  it("maps personal record to payload", () => {
    const payload = mapWorkoutPersonalRecordToPayload(createTestPersonalRecord());
    expect(payload.personalRecordId).toBe("pr-001");
    expect(payload.weightKg).toBe(100);
  });

  it("maps integration event to progress analytics DTO", () => {
    const dto = mapPayloadToProgressAnalyticsDto(createTestWorkoutProgressEvent());
    expect(Object.isFrozen(dto)).toBe(true);
    expect(dto.eventId).toBe("evt-001");
    expect(dto.metadata.source).toBe("workout");
    expect(Object.isFrozen(dto.payload.metrics)).toBe(true);
  });
});

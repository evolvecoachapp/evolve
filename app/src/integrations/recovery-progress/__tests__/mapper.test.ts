import { mapPayloadToProgressAnalyticsDto } from "../mappers/mapPayloadToProgressAnalyticsDto";
import {
  mapReadinessStateToUpdatedPayload,
  mapRecoveryAssessmentToAssessedPayload,
  mapSleepProfileToLoggedPayload,
} from "../mappers/mapRecoveryDomainToAnalyticsPayload";
import {
  createTestReadinessState,
  createTestRecoveryAssessment,
  createTestRecoveryProgressEvent,
  createTestSleepProfile,
} from "../testSupport/fixtures";

describe("recovery-progress mappers", () => {
  it("maps recovery assessment to assessed payload", () => {
    const payload = mapRecoveryAssessmentToAssessedPayload(
      createTestRecoveryAssessment(),
      "2026-08-02",
    );
    expect(Object.isFrozen(payload)).toBe(true);
    expect(payload.dayId).toBe("2026-08-02");
    expect(payload.recoveryScore).toBe(78);
  });

  it("maps sleep profile to logged payload", () => {
    const payload = mapSleepProfileToLoggedPayload(
      createTestSleepProfile(),
      "2026-08-02",
      "2026-08-02T06:00:00.000Z",
    );
    expect(payload.sleepHours).toBe(7.5);
    expect(payload.sleepQuality).toBe(82);
  });

  it("maps readiness state to updated payload", () => {
    const payload = mapReadinessStateToUpdatedPayload(
      createTestReadinessState(),
      "2026-08-02",
      "2026-08-02T08:00:00.000Z",
    );
    expect(payload.readinessScore).toBe(78);
    expect(payload.readinessLabel).toBe("good");
  });

  it("maps integration event to progress analytics DTO", () => {
    const dto = mapPayloadToProgressAnalyticsDto(createTestRecoveryProgressEvent());
    expect(Object.isFrozen(dto)).toBe(true);
    expect(dto.eventId).toBe("evt-001");
    expect(dto.metadata.source).toBe("recovery");
    expect(Object.isFrozen(dto.payload.metrics)).toBe(true);
  });
});

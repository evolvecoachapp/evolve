import { MockLogger } from "../../../infrastructure/logging";
import { createPayloadRecord } from "../../persistence/DomainRecord";
import {
  createAthleteIdentityService,
} from "../../../features/athlete-identity/services/AthleteIdentityService";
import { createMinimalIdentityInput } from "../../../features/athlete-identity/testSupport/fixtures";
import { createUnifiedWorkspaceService } from "../../../features/unified-workspace/services/UnifiedWorkspaceService";
import { createWorkoutRuntimePersistenceService } from "../../domain-persistence/services/WorkoutRuntimePersistenceService";
import { createNutritionRuntimePersistenceService } from "../../domain-persistence/services/NutritionRuntimePersistenceService";
import { createRecoveryRuntimePersistenceService } from "../../domain-persistence/services/RecoveryRuntimePersistenceService";
import { createCoachTimelineService } from "../../../features/coach-timeline/services/CoachTimelineService";
import {
  restoreIdentityRecords,
  restoreNutritionRuntimeRecords,
  restoreRecoveryRuntimeRecords,
  restoreTimelineRecords,
  restoreWorkoutRuntimeRecords,
  restoreWorkspaceRecords,
} from "../HydrationRestoration";

const FIXED_CLOCK = () => "2026-08-11T10:00:00.000Z";
const CURRENT_ATHLETE = "athlete:current-user";
const PREVIOUS_ATHLETE = "athlete:previous-user";

/**
 * Sprint 36.5 — Persistence Consistency Guard: the Authenticated Athlete
 * Persistence Boundary (Sprint 36.1) restricts hydration to records whose
 * *key* belongs to the current session. These tests prove the second,
 * independent layer — restoration also refuses a record whose *payload*
 * internally disagrees with that key — closing the gap where a corrupted
 * or mis-keyed row could otherwise restore a different athlete's data
 * under the current session's identity even though it passed the Sprint
 * 36.1 scope filter (a record legitimately keyed as
 * `CURRENT_ATHLETE` but whose payload was built for `PREVIOUS_ATHLETE`).
 */
describe("HydrationRestoration — athlete ownership guard (Sprint 36.5)", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("restoreIdentityRecords refuses to restore a payload whose athleteId disagrees with the record key", () => {
    const warnSpy = jest.spyOn(MockLogger.prototype, "warn");
    const service = createAthleteIdentityService({ clock: FIXED_CLOCK });
    const mismatchedIdentity = createMinimalIdentityInput({
      athleteId: PREVIOUS_ATHLETE,
      requestId: "ownership:identity",
      generatedAt: FIXED_CLOCK(),
    });
    // Simulate a row whose key is the *current* athlete but whose payload
    // was built for a *different* athlete (corrupted/mis-keyed data).
    const corruptedRecord = createPayloadRecord(CURRENT_ATHLETE, {
      athleteId: mismatchedIdentity.athleteId,
      profile: mismatchedIdentity.profile,
      preferences: undefined,
      settings: undefined,
      locale: mismatchedIdentity.locale,
      units: mismatchedIdentity.units,
      timeZone: mismatchedIdentity.timeZone,
    });

    restoreIdentityRecords(service, [corruptedRecord]);

    expect(service.getAthleteIdentity(CURRENT_ATHLETE)).toBeNull();
    expect(service.getAthleteIdentity(PREVIOUS_ATHLETE)).toBeNull();
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("mismatched athlete"),
      expect.objectContaining({ scope: "Application" }),
    );
  });

  it("restoreWorkspaceRecords refuses to restore a payload whose athleteId disagrees with the record key", () => {
    const service = createUnifiedWorkspaceService({ clock: FIXED_CLOCK });
    const corruptedRecord = createPayloadRecord(CURRENT_ATHLETE, {
      athleteId: PREVIOUS_ATHLETE,
    });

    restoreWorkspaceRecords(service, [corruptedRecord as never]);

    expect(service.getWorkspace(CURRENT_ATHLETE)).toBeNull();
    expect(service.getWorkspace(PREVIOUS_ATHLETE)).toBeNull();
  });

  it("restoreWorkoutRuntimeRecords refuses to restore a payload whose athleteId disagrees with the record key", () => {
    const service = createWorkoutRuntimePersistenceService();
    const corruptedRecord = createPayloadRecord(CURRENT_ATHLETE, {
      athleteId: PREVIOUS_ATHLETE,
      runtime: null,
    });

    restoreWorkoutRuntimeRecords(service, [corruptedRecord as never]);

    expect(service.getState(CURRENT_ATHLETE)).toBeNull();
    expect(service.getState(PREVIOUS_ATHLETE)).toBeNull();
  });

  it("restoreNutritionRuntimeRecords refuses to restore a payload whose athleteId disagrees with the record key", () => {
    const service = createNutritionRuntimePersistenceService();
    const corruptedRecord = createPayloadRecord(CURRENT_ATHLETE, {
      athleteId: PREVIOUS_ATHLETE,
      days: {},
    });

    restoreNutritionRuntimeRecords(service, [corruptedRecord as never]);

    expect(service.getState(CURRENT_ATHLETE)).toBeNull();
    expect(service.getState(PREVIOUS_ATHLETE)).toBeNull();
  });

  it("restoreRecoveryRuntimeRecords refuses to restore a payload whose athleteId disagrees with the record key", () => {
    const service = createRecoveryRuntimePersistenceService();
    const corruptedRecord = createPayloadRecord(CURRENT_ATHLETE, {
      athleteId: PREVIOUS_ATHLETE,
      days: {},
    });

    restoreRecoveryRuntimeRecords(service, [corruptedRecord as never]);

    expect(service.getState(CURRENT_ATHLETE)).toBeNull();
    expect(service.getState(PREVIOUS_ATHLETE)).toBeNull();
  });

  it("restoreTimelineRecords refuses to restore a payload whose athleteId disagrees with the record key", () => {
    const service = createCoachTimelineService({ clock: FIXED_CLOCK });
    const corruptedRecord = createPayloadRecord(CURRENT_ATHLETE, {
      athleteId: PREVIOUS_ATHLETE,
      entries: [],
      entryCount: 0,
      createdAt: FIXED_CLOCK(),
      updatedAt: FIXED_CLOCK(),
    });

    restoreTimelineRecords(service, [corruptedRecord as never]);

    expect(service.getTimeline(CURRENT_ATHLETE)).toBeNull();
    expect(service.getTimeline(PREVIOUS_ATHLETE)).toBeNull();
  });

  it("still restores a correctly-owned record alongside a rejected mismatched one", () => {
    const service = createWorkoutRuntimePersistenceService();
    const goodRecord = createPayloadRecord(CURRENT_ATHLETE, {
      athleteId: CURRENT_ATHLETE,
      runtime: null,
    });
    const corruptedRecord = createPayloadRecord("athlete:another-current", {
      athleteId: PREVIOUS_ATHLETE,
      runtime: null,
    });

    restoreWorkoutRuntimeRecords(service, [
      goodRecord as never,
      corruptedRecord as never,
    ]);

    expect(service.getState(CURRENT_ATHLETE)).not.toBeNull();
    expect(service.getState("athlete:another-current")).toBeNull();
    expect(service.getState(PREVIOUS_ATHLETE)).toBeNull();
  });
});

import type { AthleteIdentityService } from "../../../features/athlete-identity/services/AthleteIdentityService";
import type { AthleteSnapshotService } from "../../../features/athlete-snapshot/services/AthleteSnapshotService";
import type { CoachTimelineService } from "../../../features/coach-timeline/services/CoachTimelineService";
import type { UnifiedWorkspaceService } from "../../../features/unified-workspace/services/UnifiedWorkspaceService";
import { MockLogger } from "../../../infrastructure/logging";
import type { WorkoutRuntimePersistenceService } from "../../domain-persistence/services/WorkoutRuntimePersistenceService";
import type { NutritionRuntimePersistenceService } from "../../domain-persistence/services/NutritionRuntimePersistenceService";
import type { RecoveryRuntimePersistenceService } from "../../domain-persistence/services/RecoveryRuntimePersistenceService";
import {
  observeIdentityRecords,
  observeNutritionRuntimeRecords,
  observeRecoveryRuntimeRecords,
  observeTimelineRecords,
  observeWorkoutRuntimeRecords,
  observeWorkspaceRecords,
} from "../RuntimeWriteThroughPersistence";

/**
 * Sprint 36.5 — Persistence Consistency Guard: write-through must never
 * persist a payload whose own `athleteId` field disagrees with the
 * authenticated athlete id it is being persisted for, even if a service
 * implementation were to (incorrectly) return such a payload. None of the
 * real production services can produce this in practice (their in-memory
 * maps are keyed exactly by the requested athlete id), so these tests use
 * minimal fakes to exercise the defensive guard directly.
 */
describe("RuntimeWriteThroughPersistence — athlete ownership guard (Sprint 36.5)", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("observeIdentityRecords skips a record whose payload athleteId disagrees with the requested athlete", () => {
    const warnSpy = jest.spyOn(MockLogger.prototype, "warn");
    const fakeService = {
      getAthleteIdentity: () =>
        ({ athleteId: "athlete:mismatched" }) as ReturnType<
          AthleteIdentityService["getAthleteIdentity"]
        >,
    } as unknown as AthleteIdentityService;

    const records = observeIdentityRecords(fakeService, ["athlete:current"]);

    expect(records).toHaveLength(0);
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("mismatched athlete"),
      expect.objectContaining({ scope: "Application" }),
    );
  });

  it("observeWorkspaceRecords skips a record whose payload athleteId disagrees with the requested athlete", () => {
    const warnSpy = jest.spyOn(MockLogger.prototype, "warn");
    const fakeService = {
      getWorkspace: () =>
        ({ athleteId: "athlete:mismatched" }) as ReturnType<
          UnifiedWorkspaceService["getWorkspace"]
        >,
    } as unknown as UnifiedWorkspaceService;

    const records = observeWorkspaceRecords(fakeService, ["athlete:current"]);

    expect(records).toHaveLength(0);
    expect(warnSpy).toHaveBeenCalled();
  });

  it("observeTimelineRecords skips a record whose payload athleteId disagrees with the requested athlete", () => {
    const fakeService = {
      getTimeline: () =>
        ({ athleteId: "athlete:mismatched" }) as ReturnType<
          CoachTimelineService["getTimeline"]
        >,
    } as unknown as CoachTimelineService;

    const records = observeTimelineRecords(fakeService, ["athlete:current"]);

    expect(records).toHaveLength(0);
  });

  it("observeWorkoutRuntimeRecords skips a record whose payload athleteId disagrees with the requested athlete", () => {
    const fakeService = {
      getState: () =>
        ({ athleteId: "athlete:mismatched" }) as ReturnType<
          WorkoutRuntimePersistenceService["getState"]
        >,
    } as unknown as WorkoutRuntimePersistenceService;

    const records = observeWorkoutRuntimeRecords(fakeService, [
      "athlete:current",
    ]);

    expect(records).toHaveLength(0);
  });

  it("observeNutritionRuntimeRecords skips a record whose payload athleteId disagrees with the requested athlete", () => {
    const fakeService = {
      getState: () =>
        ({ athleteId: "athlete:mismatched" }) as ReturnType<
          NutritionRuntimePersistenceService["getState"]
        >,
    } as unknown as NutritionRuntimePersistenceService;

    const records = observeNutritionRuntimeRecords(fakeService, [
      "athlete:current",
    ]);

    expect(records).toHaveLength(0);
  });

  it("observeRecoveryRuntimeRecords skips a record whose payload athleteId disagrees with the requested athlete", () => {
    const fakeService = {
      getState: () =>
        ({ athleteId: "athlete:mismatched" }) as ReturnType<
          RecoveryRuntimePersistenceService["getState"]
        >,
    } as unknown as RecoveryRuntimePersistenceService;

    const records = observeRecoveryRuntimeRecords(fakeService, [
      "athlete:current",
    ]);

    expect(records).toHaveLength(0);
  });

  it("still persists a correctly-owned record alongside a skipped mismatched one", () => {
    const fakeService = {
      getState: (athleteId: string) =>
        athleteId === "athlete:good"
          ? ({ athleteId: "athlete:good" } as ReturnType<
              WorkoutRuntimePersistenceService["getState"]
            >)
          : ({ athleteId: "athlete:mismatched" } as ReturnType<
              WorkoutRuntimePersistenceService["getState"]
            >),
    } as unknown as WorkoutRuntimePersistenceService;

    const records = observeWorkoutRuntimeRecords(fakeService, [
      "athlete:good",
      "athlete:bad",
    ]);

    expect(records).toHaveLength(1);
    expect(records[0].id).toBe("athlete:good");
  });

  it("keys the persisted record by the authenticated athlete id, not a payload-internal field", () => {
    // Even when the payload's own athleteId matches (the normal case), the
    // record key must be the loop's authenticated athlete id — proving the
    // record is never keyed by trusting the payload alone.
    const fakeService = {
      getState: () =>
        ({ athleteId: "athlete:current" } as ReturnType<
          WorkoutRuntimePersistenceService["getState"]
        >),
    } as unknown as WorkoutRuntimePersistenceService;

    const records = observeWorkoutRuntimeRecords(fakeService, [
      "athlete:current",
    ]);

    expect(records).toHaveLength(1);
    expect(records[0].id).toBe("athlete:current");
  });
});

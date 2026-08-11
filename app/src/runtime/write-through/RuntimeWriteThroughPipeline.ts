import type { IdentityRepository } from "../../core/persistence/repositories/IdentityRepository";
import type { NutritionRepository } from "../../core/persistence/repositories/NutritionRepository";
import type { RecoveryRepository } from "../../core/persistence/repositories/RecoveryRepository";
import type { RuntimeRepository } from "../../core/persistence/repositories/RuntimeRepository";
import type { SnapshotRepository } from "../../core/persistence/repositories/SnapshotRepository";
import type { TimelineRepository } from "../../core/persistence/repositories/TimelineRepository";
import type { WorkoutRepository } from "../../core/persistence/repositories/WorkoutRepository";
import type { WorkspaceRepository } from "../../core/persistence/repositories/WorkspaceRepository";
import type { AthleteIdentityService } from "../../features/athlete-identity/services/AthleteIdentityService";
import type { AthleteSnapshotService } from "../../features/athlete-snapshot/services/AthleteSnapshotService";
import type { CoachTimelineService } from "../../features/coach-timeline/services/CoachTimelineService";
import type { RuntimeEnvironmentService } from "../../features/runtime-environment/services/RuntimeEnvironmentService";
import type { UnifiedWorkspaceService } from "../../features/unified-workspace/services/UnifiedWorkspaceService";
import type { NutritionRuntimePersistenceService } from "../domain-persistence/services/NutritionRuntimePersistenceService";
import type { RecoveryRuntimePersistenceService } from "../domain-persistence/services/RecoveryRuntimePersistenceService";
import type { WorkoutRuntimePersistenceService } from "../domain-persistence/services/WorkoutRuntimePersistenceService";
import { RUNTIME_WRITE_THROUGH_PHASES } from "./RuntimeWriteThroughInitialization";
import {
  createRuntimeWriteThroughResult,
  type RuntimeWriteThroughResult,
} from "./RuntimeWriteThroughResult";
import { createRuntimeWriteThroughState } from "./RuntimeWriteThroughState";
import {
  getRuntimeWriteThroughStateHolder,
  resetRuntimeWriteThroughStateHolder,
  setRuntimeWriteThroughStateHolder,
} from "./RuntimeWriteThroughStateHolder";
import { RUNTIME_WRITE_THROUGH_STATUS } from "./RuntimeWriteThroughStatus";
import { RuntimeWriteThroughError } from "./RuntimeWriteThroughError";
import {
  observeIdentityRecords,
  observeNutritionRuntimeRecords,
  observeRecoveryRuntimeRecords,
  observeRuntimeRecord,
  observeSnapshotRecords,
  observeTimelineRecords,
  observeWorkoutRuntimeRecords,
  observeWorkspaceRecords,
  persistRuntimeRecords,
} from "./RuntimeWriteThroughPersistence";
import {
  validateBootstrapReadyForWriteThrough,
  validateRuntimeWriteThroughCanStart,
  validateRuntimeWriteThroughState,
} from "./RuntimeWriteThroughValidation";
import {
  getWriteThroughEpoch,
  isStaleWriteThroughSequence,
  markWriteThroughSequenceApplied,
} from "./RuntimeWriteThroughSequence";

let persistPromise: Promise<RuntimeWriteThroughResult> | null = null;

export interface RuntimeWriteThroughDeps {
  readonly identityRepository: IdentityRepository;
  readonly runtimeRepository: RuntimeRepository;
  readonly workspaceRepository: WorkspaceRepository;
  readonly snapshotRepository: SnapshotRepository;
  readonly timelineRepository: TimelineRepository;
  readonly workoutRepository: WorkoutRepository;
  readonly nutritionRepository: NutritionRepository;
  readonly recoveryRepository: RecoveryRepository;
  readonly athleteIdentityService: AthleteIdentityService;
  readonly runtimeEnvironmentService: RuntimeEnvironmentService;
  readonly unifiedWorkspaceService: UnifiedWorkspaceService;
  readonly athleteSnapshotService: AthleteSnapshotService;
  readonly coachTimelineService: CoachTimelineService;
  readonly workoutRuntimePersistenceService: WorkoutRuntimePersistenceService;
  readonly nutritionRuntimePersistenceService: NutritionRuntimePersistenceService;
  readonly recoveryRuntimePersistenceService: RecoveryRuntimePersistenceService;
  readonly clock?: () => string;
}

export interface RuntimeWriteThroughOptions {
  readonly deps: RuntimeWriteThroughDeps;
  readonly athleteIds?: readonly string[];
  /** Monotonic mutation sequence guard (Sprint 36.5) — see `RuntimeWriteThroughSequence`. */
  readonly mutationSequence?: number;
}

/**
 * Runtime Write-Through Pipeline — persists in-memory runtime state through
 * repository contracts whenever composition services hold updated snapshots.
 */
export class RuntimeWriteThroughPipeline {
  static async persist(
    options: RuntimeWriteThroughOptions,
  ): Promise<RuntimeWriteThroughResult> {
    const current = getRuntimeWriteThroughStateHolder();
    validateRuntimeWriteThroughCanStart(current);
    validateBootstrapReadyForWriteThrough();

    // Persistence Consistency Guard (Sprint 36.5): reject a call whose
    // captured mutation is already older than one a completed persist has
    // reflected — before any state transition, before observing runtime
    // services, before touching a single repository. Leaves the existing
    // (fresher) write-through state/result and every repository row
    // completely untouched.
    if (
      options.mutationSequence !== undefined &&
      isStaleWriteThroughSequence(options.mutationSequence)
    ) {
      throw new RuntimeWriteThroughError(
        "Write-through call no longer reflects the latest runtime mutation",
        "stale_mutation_sequence",
      );
    }

    const capturedEpoch = getWriteThroughEpoch();
    const clock = options.deps.clock ?? (() => new Date().toISOString());
    const startedAt = clock();

    setRuntimeWriteThroughStateHolder(
      createRuntimeWriteThroughState({
        status: RUNTIME_WRITE_THROUGH_STATUS.persisting,
        startedAt,
      }),
    );

    try {
      const athleteIds = options.athleteIds ?? Object.freeze([]);
      const identityRecords = observeIdentityRecords(
        options.deps.athleteIdentityService,
        athleteIds,
      );
      const runtimeRecord = observeRuntimeRecord(
        options.deps.runtimeEnvironmentService,
      );
      const workspaceRecords = observeWorkspaceRecords(
        options.deps.unifiedWorkspaceService,
        athleteIds,
      );
      const snapshotRecords = observeSnapshotRecords(
        options.deps.athleteSnapshotService,
        athleteIds,
      );
      const timelineRecords = observeTimelineRecords(
        options.deps.coachTimelineService,
        athleteIds,
      );
      const workoutRecords = observeWorkoutRuntimeRecords(
        options.deps.workoutRuntimePersistenceService,
        athleteIds,
      );
      const nutritionRecords = observeNutritionRuntimeRecords(
        options.deps.nutritionRuntimePersistenceService,
        athleteIds,
      );
      const recoveryRecords = observeRecoveryRuntimeRecords(
        options.deps.recoveryRuntimePersistenceService,
        athleteIds,
      );

      const counts = await persistRuntimeRecords({
        identityRepository: options.deps.identityRepository,
        runtimeRepository: options.deps.runtimeRepository,
        workspaceRepository: options.deps.workspaceRepository,
        snapshotRepository: options.deps.snapshotRepository,
        timelineRepository: options.deps.timelineRepository,
        workoutRepository: options.deps.workoutRepository,
        nutritionRepository: options.deps.nutritionRepository,
        recoveryRepository: options.deps.recoveryRepository,
        identityRecords,
        runtimeRecord,
        workspaceRecords,
        snapshotRecords,
        timelineRecords,
        workoutRecords,
        nutritionRecords,
        recoveryRecords,
      });

      // Persistence Consistency Guard (Sprint 36.6): `RuntimeObserver`'s
      // `triggerWriteThrough()` resets write-through state and fires a new
      // fire-and-forget `persist()` on every successful mutation, so two
      // calls can legitimately be observing/writing concurrently (the entry
      // guard above only rejects a call that starts *after* a fresher one
      // has already completed — it cannot see a fresher call that is still
      // in flight). If, while this call's repository writes were running, a
      // later mutation's call already completed and advanced the applied
      // sequence, this call's result is stale and must never be reported as
      // the current write-through outcome — re-checking immediately after
      // the I/O settles (instead of only before it started) closes that gap.
      if (
        options.mutationSequence !== undefined &&
        isStaleWriteThroughSequence(options.mutationSequence)
      ) {
        throw new RuntimeWriteThroughError(
          "Write-through call no longer reflects the latest runtime mutation",
          "stale_mutation_sequence",
        );
      }

      // Persistence Consistency Guard (Sprint 36.6): the sequence check
      // above cannot catch a call orphaned by a *full* session teardown
      // (`RuntimeObserver.stop()` — e.g. logout) that lands mid-flight,
      // because that teardown resets the sequence counters themselves to 0,
      // so an old call's now-tiny-looking captured sequence can appear
      // "fresh" against a brand-new session's own low counters. The epoch
      // only ever increases and is never reset, so it reliably distinguishes
      // "still the same session that started me" from "torn down while I
      // was in flight" regardless of what the reset sequence numbers say.
      if (getWriteThroughEpoch() !== capturedEpoch) {
        throw new RuntimeWriteThroughError(
          "Write-through call no longer belongs to the current runtime session",
          "stale_write_through_epoch",
        );
      }

      const persistedAt = clock();
      const result = createRuntimeWriteThroughResult({
        identityRecordCount: counts.identityRecordCount,
        runtimeRecordCount: counts.runtimeRecordCount,
        workspaceRecordCount: counts.workspaceRecordCount,
        persistedAt,
        phases: RUNTIME_WRITE_THROUGH_PHASES,
      });

      const nextState = createRuntimeWriteThroughState({
        status: RUNTIME_WRITE_THROUGH_STATUS.ready,
        result,
        startedAt,
        completedAt: persistedAt,
      });
      validateRuntimeWriteThroughState(nextState);
      setRuntimeWriteThroughStateHolder(nextState);

      if (options.mutationSequence !== undefined) {
        markWriteThroughSequenceApplied(options.mutationSequence);
      }

      return result;
    } catch (error) {
      const persistError =
        error instanceof RuntimeWriteThroughError
          ? error
          : new RuntimeWriteThroughError(
              error instanceof Error
                ? error.message
                : "Runtime write-through persistence failed",
              "repository_contract_failed",
            );

      // A stale-sequence or stale-epoch rejection (whether detected before
      // touching a repository or after this call's own I/O settled — see
      // the guards above) must never overwrite the state holder. At the
      // entry guard, state is still whatever it was before this call (never
      // transitioned to "persisting"); after the post-write guards, state
      // may already hold a *fresher* mutation's successfully applied
      // "ready" result (same session) or a brand-new session's own state
      // (torn-down session), either of which must be left completely
      // untouched rather than downgraded to "failed".
      if (
        persistError.code !== "stale_mutation_sequence" &&
        persistError.code !== "stale_write_through_epoch"
      ) {
        setRuntimeWriteThroughStateHolder(
          createRuntimeWriteThroughState({
            status: RUNTIME_WRITE_THROUGH_STATUS.failed,
            error: persistError,
            startedAt,
            completedAt: clock(),
          }),
        );
      }

      throw persistError;
    }
  }

  static reset(): void {
    persistPromise = null;
    resetRuntimeWriteThroughStateHolder();
  }
}

export function resetRuntimeWriteThrough(): void {
  RuntimeWriteThroughPipeline.reset();
}

export function getRuntimeWriteThroughPromise(): Promise<RuntimeWriteThroughResult> | null {
  return persistPromise;
}

export function setRuntimeWriteThroughPromise(
  promise: Promise<RuntimeWriteThroughResult> | null,
): void {
  persistPromise = promise;
}

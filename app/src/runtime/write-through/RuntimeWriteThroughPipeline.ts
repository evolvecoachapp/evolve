import type { IdentityRepository } from "../../core/persistence/repositories/IdentityRepository";
import type { RuntimeRepository } from "../../core/persistence/repositories/RuntimeRepository";
import type { SnapshotRepository } from "../../core/persistence/repositories/SnapshotRepository";
import type { TimelineRepository } from "../../core/persistence/repositories/TimelineRepository";
import type { WorkspaceRepository } from "../../core/persistence/repositories/WorkspaceRepository";
import type { AthleteIdentityService } from "../../features/athlete-identity/services/AthleteIdentityService";
import type { AthleteSnapshotService } from "../../features/athlete-snapshot/services/AthleteSnapshotService";
import type { CoachTimelineService } from "../../features/coach-timeline/services/CoachTimelineService";
import type { RuntimeEnvironmentService } from "../../features/runtime-environment/services/RuntimeEnvironmentService";
import type { UnifiedWorkspaceService } from "../../features/unified-workspace/services/UnifiedWorkspaceService";
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
  observeRuntimeRecord,
  observeSnapshotRecords,
  observeTimelineRecords,
  observeWorkspaceRecords,
  persistRuntimeRecords,
} from "./RuntimeWriteThroughPersistence";
import {
  validateBootstrapReadyForWriteThrough,
  validateRuntimeWriteThroughCanStart,
  validateRuntimeWriteThroughState,
} from "./RuntimeWriteThroughValidation";

let persistPromise: Promise<RuntimeWriteThroughResult> | null = null;

export interface RuntimeWriteThroughDeps {
  readonly identityRepository: IdentityRepository;
  readonly runtimeRepository: RuntimeRepository;
  readonly workspaceRepository: WorkspaceRepository;
  readonly snapshotRepository: SnapshotRepository;
  readonly timelineRepository: TimelineRepository;
  readonly athleteIdentityService: AthleteIdentityService;
  readonly runtimeEnvironmentService: RuntimeEnvironmentService;
  readonly unifiedWorkspaceService: UnifiedWorkspaceService;
  readonly athleteSnapshotService: AthleteSnapshotService;
  readonly coachTimelineService: CoachTimelineService;
  readonly clock?: () => string;
}

export interface RuntimeWriteThroughOptions {
  readonly deps: RuntimeWriteThroughDeps;
  readonly athleteIds?: readonly string[];
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

      const counts = await persistRuntimeRecords({
        identityRepository: options.deps.identityRepository,
        runtimeRepository: options.deps.runtimeRepository,
        workspaceRepository: options.deps.workspaceRepository,
        snapshotRepository: options.deps.snapshotRepository,
        timelineRepository: options.deps.timelineRepository,
        identityRecords,
        runtimeRecord,
        workspaceRecords,
        snapshotRecords,
        timelineRecords,
      });

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

      setRuntimeWriteThroughStateHolder(
        createRuntimeWriteThroughState({
          status: RUNTIME_WRITE_THROUGH_STATUS.failed,
          error: persistError,
          startedAt,
          completedAt: clock(),
        }),
      );

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

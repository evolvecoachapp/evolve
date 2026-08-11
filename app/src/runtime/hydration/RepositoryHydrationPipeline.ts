import type { IdentityRepository } from "../../core/persistence/repositories/IdentityRepository";
import type { NutritionRepository } from "../../core/persistence/repositories/NutritionRepository";
import type { RecoveryRepository } from "../../core/persistence/repositories/RecoveryRepository";
import type { RuntimeRepository } from "../../core/persistence/repositories/RuntimeRepository";
import type { SnapshotRepository } from "../../core/persistence/repositories/SnapshotRepository";
import type { TimelineRepository } from "../../core/persistence/repositories/TimelineRepository";
import type { WorkoutRepository } from "../../core/persistence/repositories/WorkoutRepository";
import type { WorkspaceRepository } from "../../core/persistence/repositories/WorkspaceRepository";
import type { PersistenceRecord } from "../../core/persistence/contracts/PersistenceRecord";
import type { AthleteIdentityService } from "../../features/athlete-identity/services/AthleteIdentityService";
import type { AthleteSnapshotService } from "../../features/athlete-snapshot/services/AthleteSnapshotService";
import type { CoachTimelineService } from "../../features/coach-timeline/services/CoachTimelineService";
import type { CoachConversationService } from "../../features/coach-conversation/services/CoachConversationService";
import type { RuntimeEnvironmentService } from "../../features/runtime-environment/services/RuntimeEnvironmentService";
import type { UnifiedWorkspaceService } from "../../features/unified-workspace/services/UnifiedWorkspaceService";
import type { NutritionRuntimePersistenceService } from "../domain-persistence/services/NutritionRuntimePersistenceService";
import type { RecoveryRuntimePersistenceService } from "../domain-persistence/services/RecoveryRuntimePersistenceService";
import type { WorkoutRuntimePersistenceService } from "../domain-persistence/services/WorkoutRuntimePersistenceService";
import { filterRecordsForAthleteScope } from "./AthleteHydrationScope";
import { createHydrationResult, type HydrationResult } from "./HydrationResult";
import { createHydrationState } from "./HydrationState";
import {
  getHydrationStateHolder,
  resetHydrationStateHolder,
  setHydrationStateHolder,
} from "./HydrationStateHolder";
import { HYDRATION_STATUS } from "./HydrationStatus";
import { HydrationError } from "./HydrationError";
import {
  restoreIdentityRecords,
  restoreNutritionRuntimeRecords,
  restoreRecoveryRuntimeRecords,
  restoreRuntimeRecords,
  restoreSnapshotRecords,
  restoreTimelineRecords,
  restoreWorkoutRuntimeRecords,
  restoreWorkspaceRecords,
  restoreCoachRuntimeOverlayFromWorkspace,
} from "./HydrationRestoration";
import {
  validateBootstrapReadyForHydration,
  validateHydrationCanStart,
  validateHydrationState,
} from "./HydrationValidation";
import { HYDRATION_PHASES } from "./HydrationInitialization";

let hydrationPromise: Promise<HydrationResult> | null = null;

export interface RepositoryHydrationDeps {
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
  readonly coachConversationService: CoachConversationService;
  readonly workoutRuntimePersistenceService: WorkoutRuntimePersistenceService;
  readonly nutritionRuntimePersistenceService: NutritionRuntimePersistenceService;
  readonly recoveryRuntimePersistenceService: RecoveryRuntimePersistenceService;
  readonly clock?: () => string;
}

export interface RepositoryHydrationOptions {
  readonly deps: RepositoryHydrationDeps;
  /**
   * Authenticated Athlete Persistence Boundary (Sprint 36.1). When provided,
   * athlete-scoped repository records (identity / workspace / snapshot /
   * timeline / workout / nutrition / recovery) are restricted to these ids
   * before restoration — a previous athlete's persisted records can never be
   * restored into the current authenticated session's runtime memory.
   */
  readonly athleteIds?: readonly string[];
}

async function resolveRepositoryList(
  value:
    | Promise<readonly PersistenceRecord[]>
    | readonly PersistenceRecord[],
): Promise<readonly PersistenceRecord[]> {
  return Promise.resolve(value);
}

/**
 * Repository Hydration Pipeline — restores in-memory runtime state from
 * persistence contract repositories after Runtime Bootstrap completes.
 */
export class RepositoryHydrationPipeline {
  static async hydrate(
    options: RepositoryHydrationOptions,
  ): Promise<HydrationResult> {
    const current = getHydrationStateHolder();
    validateHydrationCanStart(current);
    validateBootstrapReadyForHydration();

    const clock = options.deps.clock ?? (() => new Date().toISOString());
    const startedAt = clock();

    setHydrationStateHolder(
      createHydrationState({
        status: HYDRATION_STATUS.hydrating,
        startedAt,
      }),
    );

    try {
      const identityRecords = await resolveRepositoryList(
        options.deps.identityRepository.list(),
      );
      const runtimeRecords = await resolveRepositoryList(
        options.deps.runtimeRepository.list(),
      );
      const workspaceRecords = await resolveRepositoryList(
        options.deps.workspaceRepository.list(),
      );
      const snapshotRecords = await resolveRepositoryList(
        options.deps.snapshotRepository.list(),
      );
      const timelineRecords = await resolveRepositoryList(
        options.deps.timelineRepository.list(),
      );
      const workoutRecords = await resolveRepositoryList(
        options.deps.workoutRepository.list(),
      );
      const nutritionRecords = await resolveRepositoryList(
        options.deps.nutritionRepository.list(),
      );
      const recoveryRecords = await resolveRepositoryList(
        options.deps.recoveryRepository.list(),
      );

      // Authenticated Athlete Persistence Boundary (Sprint 36.1): scope every
      // athlete-owned record list to the current session's athlete id(s)
      // before any restoration touches runtime memory. `runtimeRecords`
      // (device/application environment) is not athlete-scoped and is left
      // untouched.
      const scopedIdentityRecords = filterRecordsForAthleteScope(
        identityRecords,
        options.athleteIds,
      );
      const scopedWorkspaceRecords = filterRecordsForAthleteScope(
        workspaceRecords,
        options.athleteIds,
      );
      const scopedSnapshotRecords = filterRecordsForAthleteScope(
        snapshotRecords,
        options.athleteIds,
      );
      const scopedTimelineRecords = filterRecordsForAthleteScope(
        timelineRecords,
        options.athleteIds,
      );
      const scopedWorkoutRecords = filterRecordsForAthleteScope(
        workoutRecords,
        options.athleteIds,
      );
      const scopedNutritionRecords = filterRecordsForAthleteScope(
        nutritionRecords,
        options.athleteIds,
      );
      const scopedRecoveryRecords = filterRecordsForAthleteScope(
        recoveryRecords,
        options.athleteIds,
      );

      const restoredAt = clock();
      restoreIdentityRecords(
        options.deps.athleteIdentityService,
        scopedIdentityRecords,
        restoredAt,
      );
      restoreRuntimeRecords(
        options.deps.runtimeEnvironmentService,
        runtimeRecords,
        restoredAt,
      );
      restoreWorkspaceRecords(
        options.deps.unifiedWorkspaceService,
        scopedWorkspaceRecords,
      );
      restoreCoachRuntimeOverlayFromWorkspace(
        options.deps.coachConversationService,
        scopedWorkspaceRecords,
      );
      restoreSnapshotRecords(
        options.deps.athleteSnapshotService,
        scopedSnapshotRecords,
      );
      restoreTimelineRecords(
        options.deps.coachTimelineService,
        scopedTimelineRecords,
      );
      restoreWorkoutRuntimeRecords(
        options.deps.workoutRuntimePersistenceService,
        scopedWorkoutRecords,
      );
      restoreNutritionRuntimeRecords(
        options.deps.nutritionRuntimePersistenceService,
        scopedNutritionRecords,
      );
      restoreRecoveryRuntimeRecords(
        options.deps.recoveryRuntimePersistenceService,
        scopedRecoveryRecords,
      );

      const result = createHydrationResult({
        identityRecordCount: scopedIdentityRecords.length,
        runtimeRecordCount: runtimeRecords.length,
        workspaceRecordCount: scopedWorkspaceRecords.length,
        restoredAt,
        phases: HYDRATION_PHASES,
      });

      const nextState = createHydrationState({
        status: HYDRATION_STATUS.ready,
        result,
        startedAt,
        completedAt: restoredAt,
      });
      validateHydrationState(nextState);
      setHydrationStateHolder(nextState);

      return result;
    } catch (error) {
      const hydrationError =
        error instanceof HydrationError
          ? error
          : new HydrationError(
              error instanceof Error
                ? error.message
                : "Repository hydration failed",
              "repository_contract_failed",
            );

      setHydrationStateHolder(
        createHydrationState({
          status: HYDRATION_STATUS.failed,
          error: hydrationError,
          startedAt,
          completedAt: clock(),
        }),
      );

      throw hydrationError;
    }
  }

  static reset(): void {
    hydrationPromise = null;
    resetHydrationStateHolder();
  }
}

export function resetRepositoryHydration(): void {
  RepositoryHydrationPipeline.reset();
}

export function getRepositoryHydrationPromise(): Promise<HydrationResult> | null {
  return hydrationPromise;
}

export function setRepositoryHydrationPromise(
  promise: Promise<HydrationResult> | null,
): void {
  hydrationPromise = promise;
}

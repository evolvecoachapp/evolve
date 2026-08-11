import { getCompositionRoot } from "../../../core/composition/createCompositionRoot";
import type { RuntimeWriteThroughResult } from "../RuntimeWriteThroughResult";
import {
  getRuntimeWriteThroughPromise,
  RuntimeWriteThroughPipeline,
  setRuntimeWriteThroughPromise,
} from "../RuntimeWriteThroughPipeline";
import { getRuntimeWriteThroughStateHolder } from "../RuntimeWriteThroughStateHolder";
import { RUNTIME_WRITE_THROUGH_STATUS } from "../RuntimeWriteThroughStatus";

export interface PersistRuntimeOptions {
  readonly athleteIds?: readonly string[];
  /**
   * Monotonic mutation sequence guard (Sprint 36.5). When supplied,
   * `RuntimeWriteThroughPipeline.persist()` rejects this call outright if
   * its sequence is older than one already successfully applied, instead
   * of observing/writing anything — direct callers that omit this option
   * are unaffected (guard bypassed, matching pre-36.5 behavior).
   */
  readonly mutationSequence?: number;
}

/**
 * Persist in-memory runtime state through repository contracts.
 * Idempotent — subsequent calls return the same result promise.
 */
export function persistRuntime(
  options: PersistRuntimeOptions = {},
): Promise<RuntimeWriteThroughResult> {
  const state = getRuntimeWriteThroughStateHolder();

  if (
    state.status === RUNTIME_WRITE_THROUGH_STATUS.ready &&
    state.result !== null
  ) {
    return Promise.resolve(state.result);
  }

  const inFlight = getRuntimeWriteThroughPromise();
  if (inFlight) {
    return inFlight;
  }

  const next = Promise.resolve().then(async () => {
    const root = getCompositionRoot();
    const adapters = root.resolve("RepositoryAdapters");

    return RuntimeWriteThroughPipeline.persist({
      athleteIds: options.athleteIds,
      mutationSequence: options.mutationSequence,
      deps: {
        identityRepository: adapters.identity,
        runtimeRepository: adapters.runtime,
        workspaceRepository: adapters.workspace,
        snapshotRepository: adapters.snapshot,
        timelineRepository: adapters.timeline,
        workoutRepository: adapters.workout,
        nutritionRepository: adapters.nutrition,
        recoveryRepository: adapters.recovery,
        athleteIdentityService: root.resolve("AthleteIdentityService"),
        runtimeEnvironmentService: root.resolve("RuntimeEnvironmentService"),
        unifiedWorkspaceService: root.resolve("UnifiedWorkspaceService"),
        athleteSnapshotService: root.resolve("AthleteSnapshotService"),
        coachTimelineService: root.resolve("CoachTimelineService"),
        workoutRuntimePersistenceService: root.resolve(
          "WorkoutRuntimePersistenceService",
        ),
        nutritionRuntimePersistenceService: root.resolve(
          "NutritionRuntimePersistenceService",
        ),
        recoveryRuntimePersistenceService: root.resolve(
          "RecoveryRuntimePersistenceService",
        ),
      },
    });
  });

  setRuntimeWriteThroughPromise(next);
  return next;
}

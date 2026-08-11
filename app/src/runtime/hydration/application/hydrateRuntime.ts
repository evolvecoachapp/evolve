import { getCompositionRoot } from "../../../core/composition/createCompositionRoot";
import type { HydrationResult } from "../HydrationResult";
import {
  RepositoryHydrationPipeline,
  getRepositoryHydrationPromise,
  setRepositoryHydrationPromise,
} from "../RepositoryHydrationPipeline";
import { getHydrationStateHolder } from "../HydrationStateHolder";
import { HYDRATION_STATUS } from "../HydrationStatus";

export interface HydrateRuntimeOptions {
  /**
   * Authenticated Athlete Persistence Boundary (Sprint 36.1). Scopes
   * restored athlete-owned records to the current authenticated session.
   * Always supplied by `RuntimeSessionOrchestrator`; omitting it preserves
   * legacy unrestricted behavior for direct/low-level callers only.
   */
  readonly athleteIds?: readonly string[];
}

/**
 * Hydrate the application runtime from persistence contract repositories.
 * Idempotent — subsequent calls return the same result promise.
 */
export function hydrateRuntime(
  options: HydrateRuntimeOptions = {},
): Promise<HydrationResult> {
  const state = getHydrationStateHolder();

  if (state.status === HYDRATION_STATUS.ready && state.result !== null) {
    return Promise.resolve(state.result);
  }

  const inFlight = getRepositoryHydrationPromise();
  if (inFlight) {
    return inFlight;
  }

  const next = Promise.resolve().then(() => {
    const root = getCompositionRoot();
    const adapters = root.resolve("RepositoryAdapters");

    return RepositoryHydrationPipeline.hydrate({
      athleteIds: options.athleteIds,
      deps: {
        identityRepository: adapters.identity,
        runtimeRepository: adapters.runtime,
        workspaceRepository: adapters.workspace,
        snapshotRepository: adapters.snapshot,
        timelineRepository: adapters.timeline,
        athleteIdentityService: root.resolve("AthleteIdentityService"),
        runtimeEnvironmentService: root.resolve("RuntimeEnvironmentService"),
        unifiedWorkspaceService: root.resolve("UnifiedWorkspaceService"),
        athleteSnapshotService: root.resolve("AthleteSnapshotService"),
        coachTimelineService: root.resolve("CoachTimelineService"),
        coachConversationService: root.resolve("CoachConversationService"),
        workoutRepository: adapters.workout,
        nutritionRepository: adapters.nutrition,
        recoveryRepository: adapters.recovery,
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

  setRepositoryHydrationPromise(next);
  return next;
}

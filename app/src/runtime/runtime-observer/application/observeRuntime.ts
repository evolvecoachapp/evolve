import { getCompositionRoot } from "../../../core/composition/createCompositionRoot";
import type { RuntimeObserverResult } from "../RuntimeObserverResult";
import { RuntimeObserver } from "../RuntimeObserver";
import { getRuntimeObserverStateHolder } from "../RuntimeObserverStateHolder";
import { RUNTIME_OBSERVER_STATUS } from "../RuntimeObserverStatus";

export interface ObserveRuntimeOptions {
  readonly athleteIds?: readonly string[];
  readonly clock?: () => string;
}

/**
 * Start observing runtime composition services and trigger write-through on change.
 * Idempotent — subsequent calls return the same result when observation is active.
 */
export function observeRuntime(
  options: ObserveRuntimeOptions = {},
): RuntimeObserverResult {
  const state = getRuntimeObserverStateHolder();

  if (
    state.status === RUNTIME_OBSERVER_STATUS.ready &&
    state.result !== null
  ) {
    return state.result;
  }

  const root = getCompositionRoot();

  return RuntimeObserver.start({
    athleteIds: options.athleteIds,
    deps: {
      athleteIdentityService: root.resolve("AthleteIdentityService"),
      runtimeEnvironmentService: root.resolve("RuntimeEnvironmentService"),
      unifiedWorkspaceService: root.resolve("UnifiedWorkspaceService"),
      workoutRuntimePersistenceService: root.resolve(
        "WorkoutRuntimePersistenceService",
      ),
      nutritionRuntimePersistenceService: root.resolve(
        "NutritionRuntimePersistenceService",
      ),
      recoveryRuntimePersistenceService: root.resolve(
        "RecoveryRuntimePersistenceService",
      ),
      clock: options.clock,
    },
  });
}

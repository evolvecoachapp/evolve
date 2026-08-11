import type { AthleteIdentityService } from "../../features/athlete-identity/services/AthleteIdentityService";
import type { RuntimeEnvironmentService } from "../../features/runtime-environment/services/RuntimeEnvironmentService";
import type { UnifiedWorkspaceService } from "../../features/unified-workspace/services/UnifiedWorkspaceService";
import type { NutritionRuntimePersistenceService } from "../domain-persistence/services/NutritionRuntimePersistenceService";
import type { RecoveryRuntimePersistenceService } from "../domain-persistence/services/RecoveryRuntimePersistenceService";
import type { WorkoutRuntimePersistenceService } from "../domain-persistence/services/WorkoutRuntimePersistenceService";
import type { PersistRuntimeOptions } from "../write-through/application/persistRuntime";
import type { RuntimeWriteThroughResult } from "../write-through/RuntimeWriteThroughResult";
import {
  resetRuntimeWriteThrough,
} from "../write-through/RuntimeWriteThroughPipeline";
import { persistRuntime } from "../write-through/application/persistRuntime";
import { RUNTIME_OBSERVER_PHASES } from "./RuntimeObserverInitialization";
import {
  createRuntimeObserverResult,
  type RuntimeObserverResult,
} from "./RuntimeObserverResult";
import { createRuntimeObserverState } from "./RuntimeObserverState";
import {
  getRuntimeObserverStateHolder,
  resetRuntimeObserverStateHolder,
  setRuntimeObserverStateHolder,
} from "./RuntimeObserverStateHolder";
import { RUNTIME_OBSERVER_STATUS } from "./RuntimeObserverStatus";
import { RuntimeObserverError } from "./RuntimeObserverError";
import {
  validateBootstrapReadyForObserver,
  validateRuntimeObserverCanStart,
  validateRuntimeObserverState,
} from "./RuntimeObserverValidation";

type BuildUnwrapper = () => void;

interface ActiveObservation {
  /**
   * Mutable and populated incrementally as each service is wrapped (see
   * `RuntimeObserver.start`) rather than assigned once as a finished array.
   * If wrapping a later service throws, the unwrap functions already
   * pushed here are still reachable, so the catch block's
   * `unwrapActiveObservation()` can fully undo the partial wrap instead of
   * leaking permanently-wrapped `build()` methods (Sprint 36.3).
   */
  readonly unwraps: BuildUnwrapper[];
}

let activeObservation: ActiveObservation | null = null;

export interface RuntimeObserverDeps {
  readonly athleteIdentityService: AthleteIdentityService;
  readonly runtimeEnvironmentService: RuntimeEnvironmentService;
  readonly unifiedWorkspaceService: UnifiedWorkspaceService;
  readonly workoutRuntimePersistenceService: WorkoutRuntimePersistenceService;
  readonly nutritionRuntimePersistenceService: NutritionRuntimePersistenceService;
  readonly recoveryRuntimePersistenceService: RecoveryRuntimePersistenceService;
  readonly persist?: (
    options?: PersistRuntimeOptions,
  ) => Promise<RuntimeWriteThroughResult>;
  readonly resetWriteThrough?: () => void;
  readonly clock?: () => string;
}

export interface RuntimeObserverOptions {
  readonly deps: RuntimeObserverDeps;
  readonly athleteIds?: readonly string[];
}

interface BuildResultWithSuccess {
  readonly success: boolean;
}

function wrapBuildMethod<TService extends object, TResult extends BuildResultWithSuccess>(
  service: TService,
  onSuccessfulChange: () => void,
): BuildUnwrapper {
  const serviceWithBuild = service as TService & {
    build: (...args: unknown[]) => TResult;
  };
  const originalBuild = serviceWithBuild.build.bind(service);

  serviceWithBuild.build = ((...args: unknown[]) => {
    const result = originalBuild(...args);
    if (result.success) {
      onSuccessfulChange();
    }
    return result;
  }) as typeof serviceWithBuild.build;

  return () => {
    serviceWithBuild.build = originalBuild;
  };
}

function triggerWriteThrough(
  deps: RuntimeObserverDeps,
  athleteIds: readonly string[],
): void {
  const reset = deps.resetWriteThrough ?? resetRuntimeWriteThrough;
  const persist = deps.persist ?? persistRuntime;

  reset();
  void persist({ athleteIds });
}

function unwrapActiveObservation(): void {
  if (!activeObservation) {
    return;
  }

  for (const unwrap of activeObservation.unwraps) {
    unwrap();
  }

  activeObservation = null;
}

/**
 * Runtime Change Observer — watches runtime composition services and triggers
 * write-through persistence whenever in-memory state changes successfully.
 */
export class RuntimeObserver {
  static start(options: RuntimeObserverOptions): RuntimeObserverResult {
    const current = getRuntimeObserverStateHolder();
    validateRuntimeObserverCanStart(current);

    const clock = options.deps.clock ?? (() => new Date().toISOString());
    const startedAt = clock();
    const athleteIds = Object.freeze([...(options.athleteIds ?? [])]);

    setRuntimeObserverStateHolder(
      createRuntimeObserverState({
        status: RUNTIME_OBSERVER_STATUS.observing,
        startedAt,
        athleteIds,
      }),
    );

    try {
      validateBootstrapReadyForObserver();
      const onSuccessfulChange = () => {
        if (
          getRuntimeObserverStateHolder().status !==
          RUNTIME_OBSERVER_STATUS.ready
        ) {
          return;
        }

        triggerWriteThrough(options.deps, athleteIds);
      };

      const unwraps: BuildUnwrapper[] = [];
      activeObservation = { unwraps };

      unwraps.push(
        wrapBuildMethod(
          options.deps.athleteIdentityService,
          onSuccessfulChange,
        ),
      );
      unwraps.push(
        wrapBuildMethod(
          options.deps.runtimeEnvironmentService,
          onSuccessfulChange,
        ),
      );
      unwraps.push(
        wrapBuildMethod(
          options.deps.unifiedWorkspaceService,
          onSuccessfulChange,
        ),
      );
      unwraps.push(
        wrapBuildMethod(
          options.deps.workoutRuntimePersistenceService,
          onSuccessfulChange,
        ),
      );
      unwraps.push(
        wrapBuildMethod(
          options.deps.nutritionRuntimePersistenceService,
          onSuccessfulChange,
        ),
      );
      unwraps.push(
        wrapBuildMethod(
          options.deps.recoveryRuntimePersistenceService,
          onSuccessfulChange,
        ),
      );

      const completedAt = clock();
      const result = createRuntimeObserverResult({
        startedAt,
        completedAt,
        phases: RUNTIME_OBSERVER_PHASES,
      });

      const nextState = createRuntimeObserverState({
        status: RUNTIME_OBSERVER_STATUS.ready,
        result,
        startedAt,
        completedAt,
        athleteIds,
      });
      validateRuntimeObserverState(nextState);
      setRuntimeObserverStateHolder(nextState);

      return result;
    } catch (error) {
      unwrapActiveObservation();

      const observerError =
        error instanceof RuntimeObserverError
          ? error
          : new RuntimeObserverError(
              error instanceof Error
                ? error.message
                : "Runtime observer failed to start",
              "invalid_observer_state",
            );

      setRuntimeObserverStateHolder(
        createRuntimeObserverState({
          status: RUNTIME_OBSERVER_STATUS.failed,
          error: observerError,
          startedAt,
          completedAt: clock(),
          athleteIds,
        }),
      );

      throw observerError;
    }
  }

  static stop(): void {
    unwrapActiveObservation();
    resetRuntimeObserverStateHolder();
  }

  static reset(): void {
    RuntimeObserver.stop();
  }
}

export function resetRuntimeObserver(): void {
  RuntimeObserver.reset();
}

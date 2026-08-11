import { getLogger } from "../../infrastructure/logging";
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
import {
  nextRuntimeMutationSequence,
  resetRuntimeMutationSequence,
} from "../write-through/RuntimeWriteThroughSequence";
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

/**
 * Triggers write-through persistence for the latest in-memory runtime state.
 *
 * Resetting before every persist call (rather than only after a prior
 * failure) is what makes recovery deterministic: `persistRuntime()` treats
 * an already-"ready" or in-flight write-through state as idempotent and
 * simply returns the existing promise/result instead of re-persisting, and a
 * "failed" state's stale rejected promise would otherwise be returned
 * forever without an explicit reset. Resetting unconditionally guarantees
 * every successful runtime mutation — whether the previous write-through
 * succeeded, failed, or never ran — always re-observes and persists the
 * complete current runtime state (Sprint 36.4).
 *
 * The persist call is intentionally fire-and-forget from the observer's
 * perspective: a repository/write-through failure must never propagate back
 * into the `build()` call that triggered it (that would incorrectly couple
 * a persistence failure to the in-memory domain mutation that already
 * succeeded). `RuntimeWriteThroughPipeline.persist()` already records the
 * failure deterministically via its own status/error state
 * (`getWriteThroughStatus()` / `RuntimeWriteThroughService`) before
 * rethrowing — the `.catch()` below only prevents that rethrow from
 * surfacing as an unhandled promise rejection; it does not swallow or hide
 * the failure, which remains fully observable through the existing
 * write-through status/result mechanism.
 *
 * `mutationSequence` (Sprint 36.5) is the monotonic sequence number assigned
 * to the mutation that triggered this call (see `nextRuntimeMutationSequence`
 * in `onSuccessfulChange`). It travels through to
 * `RuntimeWriteThroughPipeline.persist()`, which rejects — before observing
 * or writing anything — a call whose sequence is older than one already
 * successfully applied, so an overlapping, slower persist call triggered by
 * an earlier mutation can never overwrite a newer mutation's already-applied
 * complete state.
 */
function triggerWriteThrough(
  deps: RuntimeObserverDeps,
  athleteIds: readonly string[],
  mutationSequence: number,
): void {
  const reset = deps.resetWriteThrough ?? resetRuntimeWriteThrough;
  const persist = deps.persist ?? persistRuntime;

  reset();
  void persist({ athleteIds, mutationSequence }).catch((error: unknown) => {
    logWriteThroughFailure(error);
  });
}

/**
 * Logs a persistence failure triggered by an automatic write-through
 * through the existing logging abstraction only. Runtime Observer status
 * and Runtime Session status are never affected by this failure — only the
 * Runtime Write-Through pipeline's own status transitions to "failed"
 * (already handled by `RuntimeWriteThroughPipeline.persist()`).
 */
function logWriteThroughFailure(error: unknown): void {
  const reason =
    error instanceof Error
      ? error.message
      : "Unknown runtime write-through persistence failure";
  getLogger().error("Runtime write-through persistence failed", {
    scope: "Application",
    reason,
  });
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

        triggerWriteThrough(
          options.deps,
          athleteIds,
          nextRuntimeMutationSequence(),
        );
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
    // Part of the full pipeline reset cascade only (logout/retry) — never
    // called from the per-mutation `triggerWriteThrough()` reset path, so
    // the "latest applied sequence" guard survives across every mutation
    // within a session and only clears on a genuine session boundary.
    resetRuntimeMutationSequence();
  }

  static reset(): void {
    RuntimeObserver.stop();
  }
}

export function resetRuntimeObserver(): void {
  RuntimeObserver.reset();
}

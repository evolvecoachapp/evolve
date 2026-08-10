import type { CompositionRootOptions } from "../../core/composition/CompositionRoot";
import { bootstrapRuntime } from "../bootstrap/application/bootstrapRuntime";
import { RuntimeBootstrapError } from "../bootstrap/RuntimeBootstrapError";
import { restoreDashboard } from "../dashboard-restore/application/restoreDashboard";
import { DashboardRestoreError } from "../dashboard-restore/DashboardRestoreError";
import { hydrateRuntime } from "../hydration/application/hydrateRuntime";
import { HydrationError } from "../hydration/HydrationError";
import { RUNTIME_SESSION_PHASES } from "./RuntimeSessionInitialization";
import {
  createRuntimeSessionResult,
  type RuntimeSessionResult,
} from "./RuntimeSessionResult";
import { createRuntimeSessionState } from "./RuntimeSessionState";
import {
  getRuntimeSessionStateHolder,
  resetRuntimeSessionStateHolder,
  setRuntimeSessionStateHolder,
} from "./RuntimeSessionStateHolder";
import { RUNTIME_SESSION_STATUS } from "./RuntimeSessionStatus";
import { RuntimeSessionError } from "./RuntimeSessionError";
import {
  validateRuntimeSessionCanStart,
  validateRuntimeSessionState,
} from "./RuntimeSessionValidation";

let sessionPromise: Promise<RuntimeSessionResult> | null = null;

export interface RuntimeSessionOptions {
  readonly compositionRoot?: CompositionRootOptions;
  readonly athleteIds?: readonly string[];
  readonly clock?: () => string;
}

/**
 * Runtime Session Orchestrator — coordinates bootstrap, hydration, and
 * dashboard restore pipelines in deterministic order. No business logic.
 */
export class RuntimeSessionOrchestrator {
  static async start(
    options: RuntimeSessionOptions = {},
  ): Promise<RuntimeSessionResult> {
    const current = getRuntimeSessionStateHolder();
    validateRuntimeSessionCanStart(current);

    const clock = options.clock ?? (() => new Date().toISOString());
    const startedAt = clock();

    setRuntimeSessionStateHolder(
      createRuntimeSessionState({
        status: RUNTIME_SESSION_STATUS.starting,
        startedAt,
      }),
    );

    try {
      const bootstrap = await bootstrapRuntime({
        compositionRoot: options.compositionRoot,
        clock,
      });

      const hydration = await hydrateRuntime();

      const dashboardRestore = await restoreDashboard({
        athleteIds: options.athleteIds,
      });

      const completedAt = clock();
      const result = createRuntimeSessionResult({
        startedAt,
        completedAt,
        phases: RUNTIME_SESSION_PHASES,
        bootstrap,
        hydration,
        dashboardRestore,
      });

      const nextState = createRuntimeSessionState({
        status: RUNTIME_SESSION_STATUS.ready,
        result,
        startedAt,
        completedAt,
      });
      validateRuntimeSessionState(nextState);
      setRuntimeSessionStateHolder(nextState);

      return result;
    } catch (error) {
      const sessionError = toRuntimeSessionError(error);

      setRuntimeSessionStateHolder(
        createRuntimeSessionState({
          status: RUNTIME_SESSION_STATUS.failed,
          error: sessionError,
          startedAt,
          completedAt: clock(),
        }),
      );

      throw sessionError;
    }
  }

  static reset(): void {
    sessionPromise = null;
    resetRuntimeSessionStateHolder();
  }
}

function toRuntimeSessionError(error: unknown): RuntimeSessionError {
  if (error instanceof RuntimeSessionError) {
    return error;
  }

  if (error instanceof RuntimeBootstrapError) {
    return new RuntimeSessionError(error.message, "bootstrap_failed");
  }

  if (error instanceof HydrationError) {
    return new RuntimeSessionError(error.message, "hydration_failed");
  }

  if (error instanceof DashboardRestoreError) {
    return new RuntimeSessionError(error.message, "restore_failed");
  }

  return new RuntimeSessionError(
    error instanceof Error ? error.message : "Runtime session failed",
    "bootstrap_failed",
  );
}

export function resetRuntimeSession(): void {
  RuntimeSessionOrchestrator.reset();
}

export function getRuntimeSessionPromise(): Promise<RuntimeSessionResult> | null {
  return sessionPromise;
}

export function setRuntimeSessionPromise(
  promise: Promise<RuntimeSessionResult> | null,
): void {
  sessionPromise = promise;
}

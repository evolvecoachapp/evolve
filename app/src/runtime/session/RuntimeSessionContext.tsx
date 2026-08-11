import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "../../auth/useAuth";
import { getLogger } from "../../infrastructure/logging";
import { resetRuntimeBootstrap } from "../bootstrap/RuntimeBootstrap";
import { resetDashboardRestore } from "../dashboard-restore/DashboardRestorePipeline";
import { resetRepositoryHydration } from "../hydration/RepositoryHydrationPipeline";
import { resetRuntimeWriteThrough } from "../write-through/RuntimeWriteThroughPipeline";
import { getRuntimeSessionStatus } from "./application/getRuntimeSessionStatus";
import { startRuntimeSession } from "./application/startRuntimeSession";
import type { RuntimeSessionStatus } from "./RuntimeSessionStatus";
import { RUNTIME_SESSION_STATUS } from "./RuntimeSessionStatus";
import { observeRuntime } from "../runtime-observer/application/observeRuntime";
import { resetRuntimeObserver } from "../runtime-observer/RuntimeObserver";
import { resetRuntimeSession } from "./RuntimeSessionOrchestrator";

interface RuntimeSessionContextValue {
  /** True while the runtime session is starting for authenticated users. */
  isStarting: boolean;
  status: RuntimeSessionStatus;
  retrySession: () => Promise<void>;
}

const RuntimeSessionContext = createContext<
  RuntimeSessionContextValue | undefined
>(undefined);

/**
 * Triggers the complete runtime session after auth succeeds and exposes session
 * state to authenticated route guards — mirrors the AuthProvider bootstrapping gate.
 */
export function RuntimeSessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isBootstrapping: isAuthBootstrapping, user } =
    useAuth();
  const [status, setStatus] = useState<RuntimeSessionStatus>(
    getRuntimeSessionStatus(),
  );

  const athleteIds = useMemo(
    () => (user?.id ? ([user.id] as const) : undefined),
    [user?.id],
  );

  /**
   * Retry — always starts from a full deterministic pipeline reset (Sprint
   * 36.3). A prior attempt may have failed anywhere in the pipeline
   * (bootstrap, hydration, dashboard restore) or in the runtime observer,
   * which starts *after* `startRuntimeSession` resolves and is therefore
   * outside the orchestrator's own try/catch. That means the orchestrator's
   * internal session state can be `ready` even though this provider is
   * exposing `status === "failed"` to the UI. Gating the reset on
   * `getRuntimeSessionStatus() === "failed"` (the orchestrator's state, not
   * this provider's) would miss that case and let a retry silently resume
   * from stale pipeline/observer state. Resetting unconditionally — every
   * time retry is invoked — removes that ambiguity entirely: retry is only
   * ever reachable from the failure screen, so there is never a case where
   * a full reset before restart is unsafe.
   */
  const runSession = useCallback(async () => {
    resetRuntimeSessionState();

    setStatus(RUNTIME_SESSION_STATUS.starting);
    try {
      await startRuntimeSession({ athleteIds });
      startRuntimeObserver(athleteIds);
      setStatus(RUNTIME_SESSION_STATUS.ready);
    } catch (error) {
      logRuntimeSessionFailure(error);
      setStatus(RUNTIME_SESSION_STATUS.failed);
    }
  }, [athleteIds]);

  useEffect(() => {
    if (isAuthBootstrapping) {
      return;
    }

    if (!isAuthenticated) {
      resetRuntimeSessionState();
      setStatus(RUNTIME_SESSION_STATUS.idle);
      return;
    }

    let isMounted = true;

    void startRuntimeSession({ athleteIds })
      .then(() => {
        if (!isMounted) {
          return;
        }

        try {
          startRuntimeObserver(athleteIds);
          setStatus(RUNTIME_SESSION_STATUS.ready);
        } catch (error) {
          logRuntimeSessionFailure(error);
          setStatus(RUNTIME_SESSION_STATUS.failed);
        }
      })
      .catch((error) => {
        if (isMounted) {
          logRuntimeSessionFailure(error);
          setStatus(RUNTIME_SESSION_STATUS.failed);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isAuthBootstrapping, isAuthenticated, athleteIds]);

  const isStarting =
    isAuthenticated &&
    !isAuthBootstrapping &&
    (status === RUNTIME_SESSION_STATUS.idle ||
      status === RUNTIME_SESSION_STATUS.starting);

  const value = useMemo<RuntimeSessionContextValue>(
    () => ({
      isStarting,
      status,
      retrySession: runSession,
    }),
    [isStarting, status, runSession],
  );

  return (
    <RuntimeSessionContext.Provider value={value}>
      {children}
    </RuntimeSessionContext.Provider>
  );
}

export function useRuntimeSession(): RuntimeSessionContextValue {
  const context = useContext(RuntimeSessionContext);
  if (!context) {
    throw new Error(
      "useRuntimeSession must be used within a RuntimeSessionProvider",
    );
  }
  return context;
}

function startRuntimeObserver(
  athleteIds: readonly string[] | undefined,
): void {
  observeRuntime({ athleteIds });
}

/**
 * Logs the internal failure reason through the existing logging abstraction
 * only — never surfaced to the UI. Consumers (e.g. the global runtime
 * failure screen) only ever see `status === "failed"`, not this message.
 */
function logRuntimeSessionFailure(error: unknown): void {
  const reason = error instanceof Error ? error.message : "Unknown runtime session failure";
  getLogger().error("Runtime session failed to start", {
    scope: "Application",
    reason,
  });
}

/**
 * Deterministic full runtime pipeline reset (Sprint 36.3), shared by
 * `retrySession()` and the logout effect below. Order matters and mirrors
 * a teardown from outermost consumer to innermost foundation, then the
 * session's own aggregate state last — the reverse of the startup order
 * (bootstrap → hydration → dashboard restore → session ready → observer):
 *
 *   1. Runtime Observer      — stop watching + unwrap build() wrappers first,
 *                              so nothing downstream can trigger a write
 *                              while the rest of the pipeline is being reset.
 *   2. Runtime Write-Through — clear any in-flight/completed persistence
 *                              state the observer may have triggered.
 *   3. Dashboard Restore     — depends on hydration; reset before it.
 *   4. Repository Hydration  — depends on bootstrap; reset before it.
 *   5. Runtime Bootstrap     — Composition Root + service registry
 *                              foundation; reset last of the sub-pipelines.
 *   6. Runtime Session       — the orchestrator's own aggregate state,
 *                              cleared last so nothing above can observe a
 *                              stale "ready"/"failed" session status after
 *                              this function returns.
 *
 * Reuses each subsystem's existing reset function only — no new reset APIs.
 */
function resetRuntimeSessionState(): void {
  resetRuntimeObserver();
  resetRuntimeWriteThrough();
  resetDashboardRestore();
  resetRepositoryHydration();
  resetRuntimeBootstrap();
  resetRuntimeSession();
}

/** Test-only reset helper colocated with the provider. */
export function resetRuntimeSessionForTests(): void {
  resetRuntimeSessionState();
}

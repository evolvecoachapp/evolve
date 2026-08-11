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

  const runSession = useCallback(async () => {
    if (getRuntimeSessionStatus() === RUNTIME_SESSION_STATUS.failed) {
      resetRuntimeSessionState();
    }

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

function resetRuntimeSessionState(): void {
  resetRuntimeObserver();
  resetRuntimeSession();
  resetRepositoryHydration();
  resetDashboardRestore();
  resetRuntimeBootstrap();
}

/** Test-only reset helper colocated with the provider. */
export function resetRuntimeSessionForTests(): void {
  resetRuntimeSessionState();
}

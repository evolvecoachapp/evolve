import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "../../auth/useAuth";
import { bootstrapRuntime } from "./application/bootstrapRuntime";
import { getBootstrapStatus } from "./application/getBootstrapStatus";
import type { BootstrapStatus } from "./BootstrapStatus";
import { BOOTSTRAP_STATUS } from "./BootstrapStatus";
import { resetRuntimeBootstrap } from "./RuntimeBootstrap";

interface RuntimeBootstrapContextValue {
  /** True while the runtime bootstrap gate is running for authenticated users. */
  isBootstrapping: boolean;
  status: BootstrapStatus;
  retryBootstrap: () => Promise<void>;
}

const RuntimeBootstrapContext = createContext<
  RuntimeBootstrapContextValue | undefined
>(undefined);

/**
 * Triggers Runtime Bootstrap after auth succeeds and exposes bootstrap state
 * to authenticated route guards — mirrors the AuthProvider bootstrapping gate.
 */
export function RuntimeBootstrapProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isBootstrapping: isAuthBootstrapping } = useAuth();
  const [status, setStatus] = useState<BootstrapStatus>(getBootstrapStatus());

  const runBootstrap = useCallback(async () => {
    setStatus(BOOTSTRAP_STATUS.bootstrapping);
    try {
      await bootstrapRuntime();
      setStatus(BOOTSTRAP_STATUS.ready);
    } catch {
      setStatus(BOOTSTRAP_STATUS.failed);
    }
  }, []);

  useEffect(() => {
    if (isAuthBootstrapping || !isAuthenticated) {
      setStatus(getBootstrapStatus());
      return;
    }

    let isMounted = true;

    void bootstrapRuntime()
      .then(() => {
        if (isMounted) {
          setStatus(BOOTSTRAP_STATUS.ready);
        }
      })
      .catch(() => {
        if (isMounted) {
          setStatus(BOOTSTRAP_STATUS.failed);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isAuthBootstrapping, isAuthenticated]);

  const isBootstrapping =
    isAuthenticated &&
    !isAuthBootstrapping &&
    (status === BOOTSTRAP_STATUS.idle ||
      status === BOOTSTRAP_STATUS.bootstrapping);

  const value = useMemo<RuntimeBootstrapContextValue>(
    () => ({
      isBootstrapping,
      status,
      retryBootstrap: runBootstrap,
    }),
    [isBootstrapping, status, runBootstrap],
  );

  return (
    <RuntimeBootstrapContext.Provider value={value}>
      {children}
    </RuntimeBootstrapContext.Provider>
  );
}

export function useRuntimeBootstrap(): RuntimeBootstrapContextValue {
  const context = useContext(RuntimeBootstrapContext);
  if (!context) {
    throw new Error(
      "useRuntimeBootstrap must be used within a RuntimeBootstrapProvider",
    );
  }
  return context;
}

/** Test-only reset helper colocated with the provider. */
export function resetRuntimeBootstrapForTests(): void {
  resetRuntimeBootstrap();
}

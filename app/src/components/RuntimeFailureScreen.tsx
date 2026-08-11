import { useState } from "react";
import { AppErrorFallback } from "./AppErrorFallback";

export interface RuntimeFailureScreenProps {
  /** Existing `RuntimeSessionContext.retrySession()` — no parallel retry mechanism. */
  readonly onRetry: () => Promise<void> | void;
}

/**
 * Global recovery surface shown for the entire authenticated app shell when
 * the Runtime Session (bootstrap, hydration, dashboard restore, or the
 * runtime observer) fails to start. Blocks authenticated navigation until
 * a retry succeeds — never renders the underlying exception, SQLite
 * internals, or a stack trace.
 */
export function RuntimeFailureScreen({ onRetry }: RuntimeFailureScreenProps) {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    if (isRetrying) {
      return;
    }
    setIsRetrying(true);
    try {
      await onRetry();
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <AppErrorFallback
      icon="cloud-offline-outline"
      title="EVOLVE couldn't start"
      subtitle="We weren't able to set up your local session. Please try again."
      actionLabel="Retry"
      onAction={handleRetry}
      actionLoading={isRetrying}
    />
  );
}

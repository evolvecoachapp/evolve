import { useCallback, useRef, useState } from "react";

export interface UsePullToRefreshOptions {
  readonly onRefresh: () => Promise<void>;
  readonly refreshing?: boolean;
}

/** Pull-to-refresh orchestration — presentation helper only. */
export function usePullToRefresh({
  onRefresh,
  refreshing = false,
}: UsePullToRefreshOptions) {
  const [localRefreshing, setLocalRefreshing] = useState(false);
  const inFlight = useRef(false);

  const handleRefresh = useCallback(async () => {
    if (inFlight.current) {
      return;
    }
    inFlight.current = true;
    setLocalRefreshing(true);
    try {
      await onRefresh();
    } finally {
      inFlight.current = false;
      setLocalRefreshing(false);
    }
  }, [onRefresh]);

  return {
    refreshing: refreshing || localRefreshing,
    onRefresh: handleRefresh,
  };
}

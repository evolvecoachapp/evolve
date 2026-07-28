import { useCallback, useState } from "react";

export interface UsePullToRefreshOptions {
  readonly onRefresh: () => Promise<void>;
  readonly refreshing: boolean;
}

/** RefreshControl orchestration — no business logic. */
export function usePullToRefresh({
  onRefresh,
  refreshing,
}: UsePullToRefreshOptions) {
  const [localRefreshing, setLocalRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setLocalRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setLocalRefreshing(false);
    }
  }, [onRefresh]);

  return {
    refreshing: refreshing || localRefreshing,
    onRefresh: handleRefresh,
  };
}

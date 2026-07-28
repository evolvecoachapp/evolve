import { useCallback, useState } from "react";

export interface UsePullToRefreshOptions {
  readonly onRefresh: () => Promise<void>;
  readonly refreshing?: boolean;
}

/**
 * Pull-to-refresh controller — presentation orchestration only.
 */
export function usePullToRefresh({
  onRefresh,
  refreshing: externalRefreshing,
}: UsePullToRefreshOptions) {
  const [internalRefreshing, setInternalRefreshing] = useState(false);
  const refreshing = externalRefreshing ?? internalRefreshing;

  const handleRefresh = useCallback(async () => {
    if (externalRefreshing === undefined) {
      setInternalRefreshing(true);
    }
    try {
      await onRefresh();
    } finally {
      if (externalRefreshing === undefined) {
        setInternalRefreshing(false);
      }
    }
  }, [externalRefreshing, onRefresh]);

  return {
    refreshing,
    onRefresh: handleRefresh,
  };
}

export const HomeLoadingStatuses = {
  IDLE: "idle",
  LOADING: "loading",
  REFRESHING: "refreshing",
} as const;

export type HomeLoadingStatus =
  (typeof HomeLoadingStatuses)[keyof typeof HomeLoadingStatuses];

/** Immutable Home loading state — presentation only. */
export interface HomeLoadingState {
  readonly status: HomeLoadingStatus;
  readonly isLoading: boolean;
  readonly isRefreshing: boolean;
}

export function createHomeLoadingState(
  status: HomeLoadingStatus,
): HomeLoadingState {
  return Object.freeze({
    status,
    isLoading: status === HomeLoadingStatuses.LOADING,
    isRefreshing: status === HomeLoadingStatuses.REFRESHING,
  });
}

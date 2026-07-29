export const AnalyticsLoadingStatuses = {
  IDLE: "idle",
  LOADING: "loading",
  REFRESHING: "refreshing",
} as const;

export type AnalyticsLoadingStatus =
  (typeof AnalyticsLoadingStatuses)[keyof typeof AnalyticsLoadingStatuses];

export interface AnalyticsLoadingState {
  readonly status: AnalyticsLoadingStatus;
  readonly isLoading: boolean;
  readonly isRefreshing: boolean;
}

export function createAnalyticsLoadingState(status: AnalyticsLoadingStatus): AnalyticsLoadingState {
  return Object.freeze({
    status,
    isLoading: status === AnalyticsLoadingStatuses.LOADING,
    isRefreshing: status === AnalyticsLoadingStatuses.REFRESHING,
  });
}

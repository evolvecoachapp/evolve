export const ProgressLoadingStatuses = {
  IDLE: "idle",
  LOADING: "loading",
  REFRESHING: "refreshing",
} as const;

export type ProgressLoadingStatus = (typeof ProgressLoadingStatuses)[keyof typeof ProgressLoadingStatuses];

export interface ProgressLoadingState {
  readonly status: ProgressLoadingStatus;
  readonly isLoading: boolean;
  readonly isRefreshing: boolean;
}

export function createProgressLoadingState(status: ProgressLoadingStatus): ProgressLoadingState {
  return Object.freeze({
    status,
    isLoading: status === ProgressLoadingStatuses.LOADING,
    isRefreshing: status === ProgressLoadingStatuses.REFRESHING,
  });
}

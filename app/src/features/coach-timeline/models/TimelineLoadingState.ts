export const TimelineLoadingStatuses = {
  IDLE: "idle",
  LOADING: "loading",
  REFRESHING: "refreshing",
  LOADING_MORE: "loading_more",
} as const;

export type TimelineLoadingStatus =
  (typeof TimelineLoadingStatuses)[keyof typeof TimelineLoadingStatuses];

export interface TimelineLoadingState {
  readonly status: TimelineLoadingStatus;
  readonly isLoading: boolean;
  readonly isRefreshing: boolean;
  readonly isLoadingMore: boolean;
}

export function createTimelineLoadingState(status: TimelineLoadingStatus): TimelineLoadingState {
  return Object.freeze({
    status,
    isLoading: status === TimelineLoadingStatuses.LOADING,
    isRefreshing: status === TimelineLoadingStatuses.REFRESHING,
    isLoadingMore: status === TimelineLoadingStatuses.LOADING_MORE,
  });
}

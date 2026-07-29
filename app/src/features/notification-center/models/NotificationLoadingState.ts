export const NotificationLoadingStatuses = {
  IDLE: "idle",
  LOADING: "loading",
  REFRESHING: "refreshing",
} as const;

export type NotificationLoadingStatus =
  (typeof NotificationLoadingStatuses)[keyof typeof NotificationLoadingStatuses];

export interface NotificationLoadingState {
  readonly status: NotificationLoadingStatus;
  readonly isLoading: boolean;
  readonly isRefreshing: boolean;
}

export function createNotificationLoadingState(status: NotificationLoadingStatus): NotificationLoadingState {
  return Object.freeze({
    status,
    isLoading: status === NotificationLoadingStatuses.LOADING,
    isRefreshing: status === NotificationLoadingStatuses.REFRESHING,
  });
}

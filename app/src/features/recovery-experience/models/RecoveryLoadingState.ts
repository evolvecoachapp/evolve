export const RecoveryLoadingStatuses = {
  IDLE: "idle",
  LOADING: "loading",
  REFRESHING: "refreshing",
} as const;

export type RecoveryLoadingStatus =
  (typeof RecoveryLoadingStatuses)[keyof typeof RecoveryLoadingStatuses];

export interface RecoveryLoadingState {
  readonly status: RecoveryLoadingStatus;
  readonly isLoading: boolean;
  readonly isRefreshing: boolean;
}

export function createRecoveryLoadingState(
  status: RecoveryLoadingStatus,
): RecoveryLoadingState {
  return Object.freeze({
    status,
    isLoading: status === RecoveryLoadingStatuses.LOADING,
    isRefreshing: status === RecoveryLoadingStatuses.REFRESHING,
  });
}

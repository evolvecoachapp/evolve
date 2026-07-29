export const ProfileLoadingStatuses = {
  IDLE: "idle",
  LOADING: "loading",
  REFRESHING: "refreshing",
} as const;

export type ProfileLoadingStatus =
  (typeof ProfileLoadingStatuses)[keyof typeof ProfileLoadingStatuses];

export interface ProfileLoadingState {
  readonly status: ProfileLoadingStatus;
  readonly isLoading: boolean;
  readonly isRefreshing: boolean;
}

export function createProfileLoadingState(status: ProfileLoadingStatus): ProfileLoadingState {
  return Object.freeze({
    status,
    isLoading: status === ProfileLoadingStatuses.LOADING,
    isRefreshing: status === ProfileLoadingStatuses.REFRESHING,
  });
}

export const CoachLoadingStatuses = {
  IDLE: "idle",
  LOADING: "loading",
  REFRESHING: "refreshing",
  SENDING: "sending",
} as const;

export type CoachLoadingStatus =
  (typeof CoachLoadingStatuses)[keyof typeof CoachLoadingStatuses];

/** Immutable coach loading state — presentation only. */
export interface CoachLoadingState {
  readonly status: CoachLoadingStatus;
  readonly isLoading: boolean;
  readonly isRefreshing: boolean;
  readonly isSending: boolean;
}

export function createCoachLoadingState(
  status: CoachLoadingStatus,
): CoachLoadingState {
  return Object.freeze({
    status,
    isLoading: status === CoachLoadingStatuses.LOADING,
    isRefreshing: status === CoachLoadingStatuses.REFRESHING,
    isSending: status === CoachLoadingStatuses.SENDING,
  });
}

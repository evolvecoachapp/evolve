export const GoalProgressLoadingStatuses = {
  IDLE: "idle",
  LOADING: "loading",
  REFRESHING: "refreshing",
} as const;

export type GoalProgressLoadingStatus =
  (typeof GoalProgressLoadingStatuses)[keyof typeof GoalProgressLoadingStatuses];

export interface GoalProgressLoadingState {
  readonly status: GoalProgressLoadingStatus;
  readonly isLoading: boolean;
  readonly isRefreshing: boolean;
}

export function createGoalProgressLoadingState(
  status: GoalProgressLoadingStatus,
): GoalProgressLoadingState {
  return Object.freeze({
    status,
    isLoading: status === GoalProgressLoadingStatuses.LOADING,
    isRefreshing: status === GoalProgressLoadingStatuses.REFRESHING,
  });
}

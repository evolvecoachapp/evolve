export const NutritionLoadingStatuses = {
  IDLE: "idle",
  LOADING: "loading",
  REFRESHING: "refreshing",
} as const;

export type NutritionLoadingStatus =
  (typeof NutritionLoadingStatuses)[keyof typeof NutritionLoadingStatuses];

export interface NutritionLoadingState {
  readonly status: NutritionLoadingStatus;
  readonly isLoading: boolean;
  readonly isRefreshing: boolean;
}

export function createNutritionLoadingState(status: NutritionLoadingStatus): NutritionLoadingState {
  return Object.freeze({
    status,
    isLoading: status === NutritionLoadingStatuses.LOADING,
    isRefreshing: status === NutritionLoadingStatuses.REFRESHING,
  });
}

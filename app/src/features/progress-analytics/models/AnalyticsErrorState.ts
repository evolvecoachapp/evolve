export interface AnalyticsErrorState {
  readonly message: string;
  readonly code: string;
  readonly retryable: boolean;
}

export function createAnalyticsErrorState(
  message: string,
  code = "progress_analytics_error",
  retryable = true,
): AnalyticsErrorState {
  return Object.freeze({ message, code, retryable });
}

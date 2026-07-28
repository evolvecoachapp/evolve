/** Immutable Home error state — presentation only. */
export interface HomeErrorState {
  readonly message: string;
  readonly code: string;
  readonly retryable: boolean;
}

export function createHomeErrorState(
  message: string,
  code = "home_dashboard_error",
  retryable = true,
): HomeErrorState {
  return Object.freeze({
    message,
    code,
    retryable,
  });
}

/** Immutable coach error state — presentation only. */
export interface CoachErrorState {
  readonly message: string;
  readonly code: string;
  readonly retryable: boolean;
}

export function createCoachErrorState(
  message: string,
  code = "coach_experience_error",
  retryable = true,
): CoachErrorState {
  return Object.freeze({
    message,
    code,
    retryable,
  });
}

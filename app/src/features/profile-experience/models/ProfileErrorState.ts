export interface ProfileErrorState {
  readonly message: string;
  readonly code: string;
  readonly retryable: boolean;
}

export function createProfileErrorState(
  message: string,
  code = "profile_experience_error",
  retryable = true,
): ProfileErrorState {
  return Object.freeze({ message, code, retryable });
}

export interface RecoveryErrorState {
  readonly message: string;
  readonly code: string;
  readonly retryable: boolean;
}

export function createRecoveryErrorState(
  message: string,
  code = "recovery_experience_error",
  retryable = true,
): RecoveryErrorState {
  return Object.freeze({ message, code, retryable });
}

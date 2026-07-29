export interface ProgressErrorState {
  readonly message: string;
  readonly code: string;
  readonly retryable: boolean;
}

export function createProgressErrorState(
  message: string,
  code = "progress_experience_error",
  retryable = true,
): ProgressErrorState {
  return Object.freeze({ message, code, retryable });
}

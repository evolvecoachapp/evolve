export interface GoalProgressErrorState {
  readonly message: string;
  readonly code: string;
  readonly retryable: boolean;
}

export function createGoalProgressErrorState(
  message: string,
  code = "goal_progress_experience_error",
  retryable = true,
): GoalProgressErrorState {
  return Object.freeze({ message, code, retryable });
}

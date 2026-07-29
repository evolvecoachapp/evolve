export interface TimelineErrorState {
  readonly message: string;
  readonly code: string;
  readonly retryable: boolean;
}

export function createTimelineErrorState(
  message: string,
  code = "coach_timeline_error",
  retryable = true,
): TimelineErrorState {
  return Object.freeze({ message, code, retryable });
}

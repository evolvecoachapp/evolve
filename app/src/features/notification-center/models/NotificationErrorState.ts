export interface NotificationErrorState {
  readonly message: string;
  readonly code: string;
  readonly retryable: boolean;
}

export function createNotificationErrorState(
  message: string,
  code = "notification_center_error",
  retryable = true,
): NotificationErrorState {
  return Object.freeze({ message, code, retryable });
}

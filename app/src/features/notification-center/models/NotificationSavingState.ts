export const NotificationSavingStatuses = {
  IDLE: "idle",
  SAVING: "saving",
} as const;

export type NotificationSavingStatus =
  (typeof NotificationSavingStatuses)[keyof typeof NotificationSavingStatuses];

export interface NotificationSavingState {
  readonly status: NotificationSavingStatus;
  readonly isSaving: boolean;
}

export function createNotificationSavingState(status: NotificationSavingStatus): NotificationSavingState {
  return Object.freeze({
    status,
    isSaving: status === NotificationSavingStatuses.SAVING,
  });
}

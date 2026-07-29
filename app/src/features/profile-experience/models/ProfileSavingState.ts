export const ProfileSavingStatuses = {
  IDLE: "idle",
  SAVING: "saving",
} as const;

export type ProfileSavingStatus =
  (typeof ProfileSavingStatuses)[keyof typeof ProfileSavingStatuses];

export interface ProfileSavingState {
  readonly status: ProfileSavingStatus;
  readonly isSaving: boolean;
}

export function createProfileSavingState(status: ProfileSavingStatus): ProfileSavingState {
  return Object.freeze({
    status,
    isSaving: status === ProfileSavingStatuses.SAVING,
  });
}

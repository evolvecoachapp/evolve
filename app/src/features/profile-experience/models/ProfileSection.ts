export const ProfileSectionKindValues = {
  ATHLETE: "athlete",
  GOALS: "goals",
  TRAINING: "training",
  NUTRITION: "nutrition",
  COACH: "coach",
  NOTIFICATIONS: "notifications",
  APPEARANCE: "appearance",
  UNITS: "units",
  CONNECTED_SERVICES: "connected_services",
  ABOUT: "about",
} as const;

export type ProfileSectionKind = (typeof ProfileSectionKindValues)[keyof typeof ProfileSectionKindValues];

export interface ProfileSection {
  readonly kind: ProfileSectionKind;
  readonly title: string;
  readonly subtitle: string;
  readonly icon: string;
  readonly destination: string | null;
}

export function createProfileSection(input: ProfileSection): ProfileSection {
  return Object.freeze({ ...input });
}

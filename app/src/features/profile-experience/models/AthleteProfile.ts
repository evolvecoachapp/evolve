import type { AppearancePreferences } from "./AppearancePreferences";
import type { AthleteGoal } from "./AthleteGoal";
import type { CoachPreferences } from "./CoachPreferences";
import type { ConnectedServices } from "./ConnectedServices";
import type { MeasurementUnits } from "./MeasurementUnits";
import type { NotificationPreferences } from "./NotificationPreferences";
import type { NutritionPreferences } from "./NutritionPreferences";
import type { ProfileSection } from "./ProfileSection";
import type { TrainingPreferences } from "./TrainingPreferences";
import type { ActivityLevel, FitnessGoal, Gender } from "../../shared/models";

export interface AthleteProfile {
  readonly id: string;
  readonly displayName: string;
  readonly email: string | null;
  readonly avatarUrl: string | null;
  readonly joinDate: string;
  readonly bio: string;
  readonly age: number | null;
  readonly heightCm: number | null;
  readonly weightKg: number | null;
  readonly firstName: string | null;
  readonly lastName: string | null;
  readonly gender: Gender | null;
  readonly birthDate: string | null;
  readonly targetWeightKg: number | null;
  readonly primaryGoal: FitnessGoal | null;
  readonly activityLevel: ActivityLevel | null;
  readonly goals: readonly AthleteGoal[];
  readonly trainingPreferences: TrainingPreferences;
  readonly nutritionPreferences: NutritionPreferences;
  readonly coachPreferences: CoachPreferences;
  readonly notificationPreferences: NotificationPreferences;
  readonly appearancePreferences: AppearancePreferences;
  readonly measurementUnits: MeasurementUnits;
  readonly connectedServices: ConnectedServices;
  readonly sections: readonly ProfileSection[];
  readonly accountStatus: string;
  readonly appVersion: string;
  readonly editProfileDestination: string | null;
  readonly privacyDestination: string | null;
  readonly aboutDestination: string | null;
}

export type AthleteProfileInput = Omit<
  AthleteProfile,
  | "firstName"
  | "lastName"
  | "gender"
  | "birthDate"
  | "targetWeightKg"
  | "primaryGoal"
  | "activityLevel"
> &
  Partial<
    Pick<
      AthleteProfile,
      | "firstName"
      | "lastName"
      | "gender"
      | "birthDate"
      | "targetWeightKg"
      | "primaryGoal"
      | "activityLevel"
    >
  >;

export function createAthleteProfile(input: AthleteProfileInput): AthleteProfile {
  return Object.freeze({
    ...input,
    firstName: input.firstName ?? null,
    lastName: input.lastName ?? null,
    gender: input.gender ?? null,
    birthDate: input.birthDate ?? null,
    targetWeightKg: input.targetWeightKg ?? null,
    primaryGoal: input.primaryGoal ?? null,
    activityLevel: input.activityLevel ?? null,
    goals: Object.freeze([...input.goals]),
    sections: Object.freeze([...input.sections]),
  });
}

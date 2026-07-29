import type { AppearancePreferences } from "./AppearancePreferences";
import type { AthleteGoal } from "./AthleteGoal";
import type { CoachPreferences } from "./CoachPreferences";
import type { ConnectedServices } from "./ConnectedServices";
import type { MeasurementUnits } from "./MeasurementUnits";
import type { NotificationPreferences } from "./NotificationPreferences";
import type { NutritionPreferences } from "./NutritionPreferences";
import type { ProfileSection } from "./ProfileSection";
import type { TrainingPreferences } from "./TrainingPreferences";

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

export function createAthleteProfile(input: AthleteProfile): AthleteProfile {
  return Object.freeze({
    ...input,
    goals: Object.freeze([...input.goals]),
    sections: Object.freeze([...input.sections]),
  });
}

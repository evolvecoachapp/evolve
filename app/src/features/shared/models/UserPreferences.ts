import type { CoachPreferences } from "./CoachPreferences";
import type { NotificationSettings } from "./NotificationSettings";
import type { NutritionPreferences } from "./NutritionPreferences";
import type { PrivacySettings } from "./PrivacySettings";
import type { RecoverySettings } from "./RecoverySettings";
import type { ThemePreference } from "./ThemePreference";
import type { Units } from "./Units";
import type { WorkoutPreferences } from "./WorkoutPreferences";

/** Aggregate user settings consumed by every feature module. */
export interface UserPreferences {
  userId: string;
  units: Units;
  theme: ThemePreference;
  notifications: NotificationSettings;
  coach: CoachPreferences;
  recovery: RecoverySettings;
  workout: WorkoutPreferences;
  nutrition: NutritionPreferences;
  privacy: PrivacySettings;
  updatedAt: string;
}

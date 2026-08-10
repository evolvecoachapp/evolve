import type { AthleteIdentity } from "../../athlete-identity/models/AthleteIdentity";
import type { AthleteUnits } from "../../athlete-identity/models/AthleteUnits";
import type { RuntimeEnvironment } from "../../runtime-environment/models/RuntimeEnvironment";
import {
  createAppearancePreferences,
  createAthleteProfile,
  createCoachPreferences,
  createConnectedServiceEntry,
  createConnectedServices,
  createMeasurementUnits,
  createNotificationPreferences,
  createNutritionPreferences,
  createProfileSection,
  createTrainingPreferences,
  type AthleteProfile,
  type TrainingLevel,
} from "../models";
import type { DietaryApproach } from "../models/NutritionPreferences";
import type { CoachingStyle } from "../models/CoachPreferences";
import type { ThemeMode } from "../models/AppearancePreferences";
import type { HeightUnit, WeightUnit, DistanceUnit } from "../models/MeasurementUnits";

const DEFAULT_CONNECTED_SERVICES = Object.freeze([
  { kind: "apple_health" as const, label: "Apple Health" },
  { kind: "google_fit" as const, label: "Google Fit" },
  { kind: "garmin" as const, label: "Garmin" },
  { kind: "whoop" as const, label: "WHOOP" },
  { kind: "oura" as const, label: "Oura" },
]);

const DEFAULT_SECTIONS = Object.freeze([
  { kind: "athlete" as const, title: "Athlete Profile", subtitle: "Personal information and identity", icon: "person-outline", destination: "/(app)/profile/edit" },
  { kind: "goals" as const, title: "Goals", subtitle: "Current training and body composition goals", icon: "flag-outline", destination: "/(app)/profile/goals" },
  { kind: "training" as const, title: "Training", subtitle: "Session frequency, duration, and focus", icon: "barbell-outline", destination: "/(app)/profile/training-preferences" },
  { kind: "nutrition" as const, title: "Nutrition", subtitle: "Dietary approach and calorie targets", icon: "restaurant-outline", destination: "/(app)/profile/nutrition-preferences" },
  { kind: "coach" as const, title: "Coach", subtitle: "Coaching style and feedback preferences", icon: "school-outline", destination: "/(app)/profile/coach-preferences" },
  { kind: "notifications" as const, title: "Notifications", subtitle: "Reminders and update preferences", icon: "notifications-outline", destination: "/(app)/profile/notification-preferences" },
  { kind: "appearance" as const, title: "Appearance", subtitle: "Theme and visual preferences", icon: "color-palette-outline", destination: "/(app)/profile/appearance" },
  { kind: "units" as const, title: "Units", subtitle: "Weight, distance, and height units", icon: "speedometer-outline", destination: "/(app)/profile/units" },
  { kind: "connected_services" as const, title: "Connected Services", subtitle: "Health and fitness integrations", icon: "link-outline", destination: "/(app)/profile/connected-services" },
  { kind: "about" as const, title: "About EVOLVE", subtitle: "Version, privacy, and legal", icon: "information-circle-outline", destination: "/(app)/profile/about" },
]);

function computeAge(birthYear: number | null, referenceDate: Date): number | null {
  if (birthYear === null) {
    return null;
  }
  const age = referenceDate.getFullYear() - birthYear;
  return age >= 0 ? age : null;
}

function toJoinDate(createdAt: string): string {
  return createdAt.slice(0, 10);
}

function mapTrainingLevel(experienceLevel: string | null): TrainingLevel {
  const normalized = experienceLevel?.trim().toLowerCase();
  if (
    normalized === "beginner" ||
    normalized === "intermediate" ||
    normalized === "advanced" ||
    normalized === "elite"
  ) {
    return normalized;
  }
  return "intermediate";
}

function mapCoachingStyle(tone: string | null): CoachingStyle {
  const normalized = tone?.trim().toLowerCase();
  if (
    normalized === "supportive" ||
    normalized === "directive" ||
    normalized === "analytical" ||
    normalized === "motivational"
  ) {
    return normalized;
  }
  if (normalized === "direct") {
    return "directive";
  }
  return "supportive";
}

function mapDietaryApproach(value: string | undefined): DietaryApproach {
  const normalized = value?.trim().toLowerCase().replace(/[\s-]+/g, "_");
  if (
    normalized === "balanced" ||
    normalized === "high_protein" ||
    normalized === "low_carb" ||
    normalized === "keto" ||
    normalized === "vegetarian" ||
    normalized === "vegan" ||
    normalized === "paleo" ||
    normalized === "custom"
  ) {
    return normalized;
  }
  return "balanced";
}

function mapTheme(appearance: string): ThemeMode {
  if (appearance === "light" || appearance === "dark" || appearance === "system") {
    return appearance;
  }
  return "system";
}

function mapWeightUnit(mass: AthleteUnits["mass"]): WeightUnit {
  return mass === "lb" ? "lb" : "kg";
}

function mapDistanceUnit(distance: AthleteUnits["distance"]): DistanceUnit {
  return distance === "mi" ? "mi" : "km";
}

function mapHeightUnit(length: AthleteUnits["length"]): HeightUnit {
  return length === "in" ? "ft_in" : "cm";
}

export interface MapAthleteIdentityToProfileInput {
  readonly identity: AthleteIdentity;
  readonly runtimeEnvironment?: RuntimeEnvironment | null;
  readonly referenceDate?: Date;
}

/**
 * Projects hydrated Athlete Identity into the Profile Experience read model.
 */
export function mapAthleteIdentityToProfile(
  input: MapAthleteIdentityToProfileInput,
): AthleteProfile {
  const { identity } = input;
  const referenceDate = input.referenceDate ?? new Date(identity.createdAt);
  const profile = identity.profile;
  const preferences = identity.preferences;
  const settings = identity.settings;
  const units = identity.units;
  const appVersion =
    input.runtimeEnvironment?.application.version ??
    identity.metadata.version;

  return createAthleteProfile({
    id: identity.athleteId,
    displayName: profile.displayName,
    email: null,
    avatarUrl: null,
    joinDate: toJoinDate(identity.createdAt),
    bio: preferences.notes.join(". ").trim(),
    age: computeAge(profile.birthYear, referenceDate),
    heightCm: null,
    weightKg: null,
    goals: Object.freeze([]),
    trainingPreferences: createTrainingPreferences({
      level: mapTrainingLevel(profile.experienceLevel),
      sessionsPerWeek: 0,
      preferredDuration: 0,
      preferredTime: preferences.preferredTrainingTimes[0] ?? "",
      focusAreas: Object.freeze([...preferences.preferredModalities]),
      equipmentAvailable: Object.freeze([]),
      destination: "/(app)/profile/training-preferences",
    }),
    nutritionPreferences: createNutritionPreferences({
      dietaryApproach: mapDietaryApproach(preferences.dietaryPreferences[0]),
      calorieTarget: 0,
      mealsPerDay: 0,
      allergies: Object.freeze([]),
      supplements: Object.freeze([]),
      destination: "/(app)/profile/nutrition-preferences",
    }),
    coachPreferences: createCoachPreferences({
      coachingStyle: mapCoachingStyle(preferences.communicationTone),
      motivationLevel: "moderate",
      feedbackFrequency: "regular",
      explanationDepth: "moderate",
      destination: "/(app)/profile/coach-preferences",
    }),
    notificationPreferences: createNotificationPreferences({
      workoutReminders: false,
      mealReminders: false,
      hydrationReminders: false,
      coachMessages: false,
      progressUpdates: false,
      destination: "/(app)/profile/notification-preferences",
    }),
    appearancePreferences: createAppearancePreferences({
      theme: mapTheme(settings.appearance),
      accentColor: null,
      destination: "/(app)/profile/appearance",
    }),
    measurementUnits: createMeasurementUnits({
      weight: mapWeightUnit(units.mass),
      distance: mapDistanceUnit(units.distance),
      height: mapHeightUnit(units.length),
    }),
    connectedServices: createConnectedServices({
      services: Object.freeze(
        DEFAULT_CONNECTED_SERVICES.map((service) =>
          createConnectedServiceEntry({
            kind: service.kind,
            label: service.label,
            isConnected: false,
            lastSyncLabel: null,
            destination: `/(app)/profile/service/${service.kind}`,
          }),
        ),
      ),
    }),
    sections: Object.freeze(
      DEFAULT_SECTIONS.map((section) => createProfileSection({ ...section })),
    ),
    accountStatus: "Active",
    appVersion,
    editProfileDestination: "/(app)/profile/edit",
    privacyDestination: "/(app)/profile/privacy",
    aboutDestination: "/(app)/profile/about",
  });
}

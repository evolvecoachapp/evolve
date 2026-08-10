import type { BuildPreferencesInput } from "../../athlete-identity/services/buildPreferences";
import type { BuildProfileInput } from "../../athlete-identity/services/buildProfile";
import type { BuildSettingsInput } from "../../athlete-identity/services/buildSettings";
import type { BuildUnitsInput } from "../../athlete-identity/services/buildUnits";
import type { AthletePreferences } from "../../athlete-identity/models/AthletePreferences";
import type { AthleteProfile as IdentityProfile } from "../../athlete-identity/models/AthleteProfile";
import type { AthleteSettings } from "../../athlete-identity/models/AthleteSettings";
import type { CoachingStyle } from "../models/CoachPreferences";
import type { DietaryApproach } from "../models/NutritionPreferences";
import type {
  AppearancePreferencesDto,
  CoachPreferencesDto,
  MeasurementUnitsDto,
  NutritionPreferencesDto,
  TrainingPreferencesDto,
} from "../services";

function mapCoachingStyleToCommunicationTone(style: CoachingStyle): string {
  if (style === "directive") {
    return "direct";
  }
  return style;
}

export function mapMeasurementUnitsDtoToBuildUnits(
  units: MeasurementUnitsDto,
): BuildUnitsInput {
  const isImperial =
    units.weight === "lb" ||
    units.distance === "mi" ||
    units.height === "ft_in";

  return {
    system: isImperial ? "imperial" : "metric",
    mass: units.weight === "lb" ? "lb" : "kg",
    length: units.height === "ft_in" ? "in" : "cm",
    distance: units.distance === "mi" ? "mi" : "km",
  };
}

export function mapAppearanceDtoToBuildSettings(
  prefs: AppearancePreferencesDto,
): BuildSettingsInput {
  return { appearance: prefs.theme };
}

export function mergeIdentitySettings(
  current: AthleteSettings,
  update: BuildSettingsInput,
): BuildSettingsInput {
  return {
    weekStartsOn: update.weekStartsOn ?? current.weekStartsOn,
    use24HourClock: update.use24HourClock ?? current.use24HourClock,
    appearance: update.appearance ?? current.appearance,
  };
}

export function mapTrainingPreferencesDtoToIdentityUpdate(
  prefs: TrainingPreferencesDto,
  currentProfile: IdentityProfile,
  currentPreferences: AthletePreferences,
): {
  readonly profile: BuildProfileInput;
  readonly preferences: BuildPreferencesInput;
} {
  return {
    profile: {
      displayName: currentProfile.displayName,
      givenName: currentProfile.givenName,
      familyName: currentProfile.familyName,
      sex: currentProfile.sex,
      birthYear: currentProfile.birthYear,
      experienceLevel: prefs.level,
    },
    preferences: {
      preferredTrainingTimes: prefs.preferredTime
        ? Object.freeze([prefs.preferredTime])
        : Object.freeze([...currentPreferences.preferredTrainingTimes]),
      preferredModalities: Object.freeze([...prefs.focusAreas]),
      dietaryPreferences: Object.freeze([...currentPreferences.dietaryPreferences]),
      communicationTone: currentPreferences.communicationTone,
      notes: Object.freeze([...currentPreferences.notes]),
    },
  };
}

export function mapNutritionPreferencesDtoToIdentityUpdate(
  prefs: NutritionPreferencesDto,
  currentPreferences: AthletePreferences,
): BuildPreferencesInput {
  return {
    preferredTrainingTimes: Object.freeze([...currentPreferences.preferredTrainingTimes]),
    preferredModalities: Object.freeze([...currentPreferences.preferredModalities]),
    dietaryPreferences: Object.freeze([prefs.dietaryApproach as DietaryApproach]),
    communicationTone: currentPreferences.communicationTone,
    notes: Object.freeze([...currentPreferences.notes]),
  };
}

export function mapCoachPreferencesDtoToIdentityUpdate(
  prefs: CoachPreferencesDto,
  currentPreferences: AthletePreferences,
): BuildPreferencesInput {
  return {
    preferredTrainingTimes: Object.freeze([...currentPreferences.preferredTrainingTimes]),
    preferredModalities: Object.freeze([...currentPreferences.preferredModalities]),
    dietaryPreferences: Object.freeze([...currentPreferences.dietaryPreferences]),
    communicationTone: mapCoachingStyleToCommunicationTone(prefs.coachingStyle),
    notes: Object.freeze([...currentPreferences.notes]),
  };
}

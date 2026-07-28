import type { AthleteIdentity } from "../models/AthleteIdentity";
import type { AthleteIdentityResult } from "../models/AthleteIdentityResult";
import type { AthleteLocale } from "../models/AthleteLocale";
import type { AthletePreferences } from "../models/AthletePreferences";
import type { AthleteProfile } from "../models/AthleteProfile";
import type { AthleteSettings } from "../models/AthleteSettings";
import type { AthleteTimeZone } from "../models/AthleteTimeZone";
import type { AthleteUnits } from "../models/AthleteUnits";
import { buildLocale, type BuildLocaleInput } from "./buildLocale";
import {
  buildPreferences,
  type BuildPreferencesInput,
} from "./buildPreferences";
import { buildProfile, type BuildProfileInput } from "./buildProfile";
import { buildSettings, type BuildSettingsInput } from "./buildSettings";
import { buildTimeZone, type BuildTimeZoneInput } from "./buildTimeZone";
import { buildUnits, type BuildUnitsInput } from "./buildUnits";
import {
  validateIdentity,
  type ValidateIdentityOptions,
} from "./validateIdentity";

export interface BuildAthleteIdentityInput {
  readonly athleteId: string;
  readonly requestId: string;
  readonly generatedAt: string;
  readonly version?: string;
  readonly schemaVersion?: string;
  readonly profile: BuildProfileInput | AthleteProfile;
  readonly preferences?: BuildPreferencesInput | AthletePreferences;
  readonly settings?: BuildSettingsInput | AthleteSettings;
  readonly locale: BuildLocaleInput | AthleteLocale;
  readonly units: BuildUnitsInput | AthleteUnits;
  readonly timeZone: BuildTimeZoneInput | AthleteTimeZone;
  readonly validationOptions?: ValidateIdentityOptions;
}

function isAthleteProfile(
  value: BuildProfileInput | AthleteProfile,
): value is AthleteProfile {
  return (
    typeof value === "object" &&
    value !== null &&
    "displayName" in value &&
    Object.isFrozen(value) &&
    "givenName" in value &&
    "familyName" in value &&
    "sex" in value &&
    "birthYear" in value &&
    "experienceLevel" in value
  );
}

function isAthleteLocale(
  value: BuildLocaleInput | AthleteLocale,
): value is AthleteLocale {
  return (
    typeof value === "object" &&
    value !== null &&
    Object.isFrozen(value) &&
    "languageTag" in value &&
    "language" in value &&
    "region" in value &&
    "script" in value
  );
}

function isAthleteUnits(
  value: BuildUnitsInput | AthleteUnits,
): value is AthleteUnits {
  return (
    typeof value === "object" &&
    value !== null &&
    Object.isFrozen(value) &&
    "system" in value &&
    "mass" in value &&
    "length" in value &&
    "distance" in value &&
    "energy" in value
  );
}

function isAthleteTimeZone(
  value: BuildTimeZoneInput | AthleteTimeZone,
): value is AthleteTimeZone {
  return (
    typeof value === "object" &&
    value !== null &&
    Object.isFrozen(value) &&
    "iana" in value &&
    "offsetMinutes" in value &&
    "displayName" in value
  );
}

function isAthletePreferences(
  value: BuildPreferencesInput | AthletePreferences,
): value is AthletePreferences {
  return (
    typeof value === "object" &&
    value !== null &&
    Object.isFrozen(value) &&
    "preferredTrainingTimes" in value &&
    "preferredModalities" in value &&
    "dietaryPreferences" in value &&
    "communicationTone" in value &&
    "notes" in value
  );
}

function isAthleteSettings(
  value: BuildSettingsInput | AthleteSettings,
): value is AthleteSettings {
  return (
    typeof value === "object" &&
    value !== null &&
    Object.isFrozen(value) &&
    "weekStartsOn" in value &&
    "use24HourClock" in value &&
    "appearance" in value
  );
}

/**
 * Composes the complete immutable Athlete Identity.
 */
export function buildAthleteIdentity(
  input: BuildAthleteIdentityInput,
): AthleteIdentityResult {
  const version = input.version ?? "29.1";
  const schemaVersion = input.schemaVersion ?? "1.0";
  const identityId = `athlete-identity:${input.athleteId}:${input.requestId}`;

  const profile = isAthleteProfile(input.profile)
    ? input.profile
    : buildProfile(input.profile);
  const preferences =
    input.preferences && isAthletePreferences(input.preferences)
      ? input.preferences
      : buildPreferences(input.preferences ?? {});
  const settings =
    input.settings && isAthleteSettings(input.settings)
      ? input.settings
      : buildSettings(input.settings ?? {});
  const locale = isAthleteLocale(input.locale)
    ? input.locale
    : buildLocale(input.locale);
  const units = isAthleteUnits(input.units)
    ? input.units
    : buildUnits(input.units);
  const timeZone = isAthleteTimeZone(input.timeZone)
    ? input.timeZone
    : buildTimeZone(input.timeZone);

  const metadata = Object.freeze({
    generatedAt: input.generatedAt,
    version,
    identityId,
    schemaVersion,
  });

  const identity: AthleteIdentity = Object.freeze({
    id: identityId,
    athleteId: input.athleteId,
    profile,
    preferences,
    settings,
    locale,
    units,
    timeZone,
    metadata,
    createdAt: input.generatedAt,
  });

  const validation = validateIdentity(identity, input.validationOptions);
  if (!validation.valid) {
    return Object.freeze({
      id: `athlete-identity-result:${input.requestId}:invalid`,
      success: false,
      identity: null,
      profile: null,
      metadata: null,
      validation,
      message: `Athlete identity validation failed: ${validation.errors.join("; ")}`,
      generatedAt: input.generatedAt,
    });
  }

  return Object.freeze({
    id: `athlete-identity-result:${input.requestId}`,
    success: true,
    identity,
    profile,
    metadata,
    validation,
    message:
      "Athlete identity composed deterministically as an immutable foundation.",
    generatedAt: input.generatedAt,
  });
}

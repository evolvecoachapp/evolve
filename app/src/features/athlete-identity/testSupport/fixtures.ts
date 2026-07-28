import type { BuildAthleteIdentityInput } from "../services/buildAthleteIdentity";
import {
  createAthleteIdentityService,
  type AthleteIdentityService,
} from "../services/AthleteIdentityService";

export const FIXED_IDENTITY_TIMESTAMP = "2026-07-28T12:00:00.000Z";

export function createMinimalIdentityInput(
  overrides: Partial<BuildAthleteIdentityInput> & {
    readonly athleteId?: string;
    readonly requestId?: string;
  } = {},
): BuildAthleteIdentityInput {
  const athleteId = overrides.athleteId ?? "athlete:1";
  const requestId = overrides.requestId ?? "req:identity:1";

  return {
    athleteId,
    requestId,
    generatedAt: overrides.generatedAt ?? FIXED_IDENTITY_TIMESTAMP,
    version: overrides.version ?? "29.1",
    schemaVersion: overrides.schemaVersion ?? "1.0",
    profile: overrides.profile ?? {
      displayName: "Alex Athlete",
      givenName: "Alex",
      familyName: "Athlete",
      sex: "unspecified",
      birthYear: 1990,
      experienceLevel: "intermediate",
    },
    preferences: overrides.preferences ?? {
      preferredTrainingTimes: Object.freeze(["morning"]),
      preferredModalities: Object.freeze(["strength"]),
      dietaryPreferences: Object.freeze(["balanced"]),
      communicationTone: "direct",
      notes: Object.freeze(["identity fixture"]),
    },
    settings: overrides.settings ?? {
      weekStartsOn: 1,
      use24HourClock: true,
      appearance: "system",
    },
    locale: overrides.locale ?? {
      languageTag: "en-US",
    },
    units: overrides.units ?? {
      system: "metric",
    },
    timeZone: overrides.timeZone ?? {
      iana: "America/New_York",
      displayName: "Eastern Time",
    },
    validationOptions: overrides.validationOptions,
  };
}

export function createTestAthleteIdentityService(
  clock: () => string = () => FIXED_IDENTITY_TIMESTAMP,
): AthleteIdentityService {
  return createAthleteIdentityService({
    clock,
    version: "29.1",
    schemaVersion: "1.0",
  });
}

import { composeAthleteIdentity } from "../../athlete-identity/application";
import type { BuildPreferencesInput } from "../../athlete-identity/services/buildPreferences";
import type { BuildProfileInput } from "../../athlete-identity/services/buildProfile";
import type { BuildSettingsInput } from "../../athlete-identity/services/buildSettings";
import type { BuildUnitsInput } from "../../athlete-identity/services/buildUnits";
import { buildSettings } from "../../athlete-identity/services/buildSettings";
import { buildPreferences } from "../../athlete-identity/services/buildPreferences";
import { buildProfile } from "../../athlete-identity/services/buildProfile";
import { buildUnits } from "../../athlete-identity/services/buildUnits";
import { getCompositionRoot } from "../../../core/composition/createCompositionRoot";
import { mapAthleteIdentityToProfile } from "../mappers/mapAthleteIdentityToProfile";
import { mergeIdentitySettings } from "../mappers/mapProfileUpdateToIdentity";
import type { AthleteProfile } from "../models";
import { ProfileExperienceError } from "../services";
import { readHydratedProfile } from "../services/readHydratedProfile";

export interface IdentityProfileUpdate {
  readonly profile?: BuildProfileInput;
  readonly preferences?: BuildPreferencesInput;
  readonly settings?: BuildSettingsInput;
  readonly units?: BuildUnitsInput;
}

export interface UpdateAthleteIdentityFromProfileDeps {
  readonly athleteId: string;
  readonly requestId: string;
  readonly update: IdentityProfileUpdate;
}

function createRequestId(athleteId: string, kind: string): string {
  return `profile:update:${kind}:${athleteId}:${Date.now()}`;
}

export function createProfileIdentityRequestId(
  athleteId: string,
  kind: string,
): string {
  return createRequestId(athleteId, kind);
}

/**
 * Rebuilds Athlete Identity from the current hydrated record plus explicit updates.
 * Successful builds are observed by Runtime Observer for write-through persistence.
 */
export function updateAthleteIdentityFromProfile(
  deps: UpdateAthleteIdentityFromProfileDeps,
): AthleteProfile {
  const root = getCompositionRoot();
  const identityService = root.resolve("AthleteIdentityService");
  const current = identityService.getAthleteIdentity(deps.athleteId);

  if (!current) {
    throw new ProfileExperienceError("Athlete identity unavailable.");
  }

  const profile = deps.update.profile
    ? buildProfile(deps.update.profile)
    : current.profile;
  const preferences = deps.update.preferences
    ? buildPreferences(deps.update.preferences)
    : current.preferences;
  const settings = deps.update.settings
    ? buildSettings(mergeIdentitySettings(current.settings, deps.update.settings))
    : current.settings;
  const units = deps.update.units
    ? buildUnits(deps.update.units)
    : current.units;

  const result = composeAthleteIdentity({
    service: identityService,
    input: {
      athleteId: deps.athleteId,
      requestId: deps.requestId,
      profile,
      preferences,
      settings,
      locale: current.locale,
      units,
      timeZone: current.timeZone,
    },
  });

  if (!result.success || !result.identity) {
    throw new ProfileExperienceError(result.message);
  }

  const runtimeEnvironment =
    root.resolve("RuntimeEnvironmentService").getRuntimeEnvironment();

  return mapAthleteIdentityToProfile({
    identity: result.identity,
    runtimeEnvironment,
  });
}

/** Returns the hydrated profile without mutating identity (unsupported profile fields). */
export function readRuntimeProfile(athleteId: string): AthleteProfile {
  const profile = readHydratedProfile(athleteId);
  if (!profile) {
    throw new ProfileExperienceError("Athlete identity unavailable.");
  }
  return profile;
}

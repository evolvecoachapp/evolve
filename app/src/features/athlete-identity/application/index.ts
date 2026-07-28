import type { AthleteIdentity } from "../models/AthleteIdentity";
import type {
  AthleteIdentityResult,
  AthleteIdentityValidation,
} from "../models/AthleteIdentityResult";
import type { AthletePreferences } from "../models/AthletePreferences";
import type { AthleteProfile } from "../models/AthleteProfile";
import type { AthleteSettings } from "../models/AthleteSettings";
import {
  createAthleteIdentityService,
  type AthleteIdentityService,
  type AthleteIdentityServiceDeps,
} from "../services/AthleteIdentityService";
import type { BuildAthleteIdentityInput } from "../services/buildAthleteIdentity";

function resolveService(
  service: AthleteIdentityService | undefined,
  deps: AthleteIdentityServiceDeps | undefined,
): AthleteIdentityService {
  if (service) return service;
  return createAthleteIdentityService(deps ?? {});
}

type BuildInput = Omit<
  BuildAthleteIdentityInput,
  "generatedAt" | "version" | "schemaVersion" | "validationOptions"
> & {
  readonly generatedAt?: string;
};

/** Public API — compose Athlete Identity from explicit identity fields. */
export function composeAthleteIdentity(options: {
  readonly input: BuildInput;
  readonly service?: AthleteIdentityService;
  readonly deps?: AthleteIdentityServiceDeps;
}): AthleteIdentityResult {
  return resolveService(options.service, options.deps).build(options.input);
}

/** Application API — full Athlete Identity. */
export function getAthleteIdentity(options: {
  readonly athleteId: string;
  readonly service?: AthleteIdentityService;
  readonly deps?: AthleteIdentityServiceDeps;
}): AthleteIdentity | null {
  return resolveService(options.service, options.deps).getAthleteIdentity(
    options.athleteId,
  );
}

/** Application API — athlete profile. */
export function getAthleteProfile(options: {
  readonly athleteId: string;
  readonly service?: AthleteIdentityService;
  readonly deps?: AthleteIdentityServiceDeps;
}): AthleteProfile | null {
  return resolveService(options.service, options.deps).getAthleteProfile(
    options.athleteId,
  );
}

/** Application API — athlete preferences. */
export function getPreferences(options: {
  readonly athleteId: string;
  readonly service?: AthleteIdentityService;
  readonly deps?: AthleteIdentityServiceDeps;
}): AthletePreferences | null {
  return resolveService(options.service, options.deps).getPreferences(
    options.athleteId,
  );
}

/** Application API — athlete settings. */
export function getSettings(options: {
  readonly athleteId: string;
  readonly service?: AthleteIdentityService;
  readonly deps?: AthleteIdentityServiceDeps;
}): AthleteSettings | null {
  return resolveService(options.service, options.deps).getSettings(
    options.athleteId,
  );
}

/** Public API — validate latest Athlete Identity for athlete. */
export function validateAthleteIdentityForAthlete(options: {
  readonly athleteId: string;
  readonly service?: AthleteIdentityService;
  readonly deps?: AthleteIdentityServiceDeps;
}): AthleteIdentityValidation {
  return resolveService(options.service, options.deps).validate(
    options.athleteId,
  );
}

export type { AthleteIdentityServiceDeps };

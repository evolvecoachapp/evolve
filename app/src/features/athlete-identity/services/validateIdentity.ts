import type { AthleteIdentity } from "../models/AthleteIdentity";
import type { AthleteIdentityValidation } from "../models/AthleteIdentityResult";
import type { AthleteLocale } from "../models/AthleteLocale";
import type { AthleteTimeZone } from "../models/AthleteTimeZone";
import type { AthleteUnits } from "../models/AthleteUnits";

const LANGUAGE_TAG_PATTERN =
  /^[A-Za-z]{2,3}(-[A-Za-z]{4})?(-[A-Za-z]{2}|-[0-9]{3})?(-[A-Za-z0-9]{5,8})*$/;

const VALID_UNIT_SYSTEMS = new Set(["metric", "imperial"]);
const VALID_MASS = new Set(["kg", "lb"]);
const VALID_LENGTH = new Set(["cm", "in"]);
const VALID_DISTANCE = new Set(["km", "mi"]);
const VALID_ENERGY = new Set(["kcal", "kJ"]);

function isFrozen(value: unknown): boolean {
  return typeof value === "object" && value !== null && Object.isFrozen(value);
}

function isValidLanguageTag(languageTag: string): boolean {
  if (!languageTag || !LANGUAGE_TAG_PATTERN.test(languageTag)) {
    return false;
  }
  try {
    const canonical = Intl.getCanonicalLocales(languageTag);
    return canonical.length > 0;
  } catch {
    return false;
  }
}

function isValidIanaTimeZone(iana: string): boolean {
  if (!iana || !iana.includes("/")) {
    return false;
  }
  try {
    Intl.DateTimeFormat(undefined, { timeZone: iana });
    return true;
  } catch {
    return false;
  }
}

function validateLocale(
  locale: AthleteLocale | null | undefined,
  errors: string[],
): void {
  if (!locale) {
    errors.push("Locale is required");
    return;
  }
  if (!locale.languageTag) {
    errors.push("Locale languageTag is required");
  } else if (!isValidLanguageTag(locale.languageTag)) {
    errors.push(`Invalid locale: ${locale.languageTag}`);
  }
  if (!locale.language) {
    errors.push("Locale language is required");
  }
}

function validateUnits(
  units: AthleteUnits | null | undefined,
  errors: string[],
): void {
  if (!units) {
    errors.push("Units are required");
    return;
  }
  if (!VALID_UNIT_SYSTEMS.has(units.system)) {
    errors.push(`Invalid units: ${String(units.system)}`);
  }
  if (!VALID_MASS.has(units.mass)) {
    errors.push(`Invalid units mass: ${String(units.mass)}`);
  }
  if (!VALID_LENGTH.has(units.length)) {
    errors.push(`Invalid units length: ${String(units.length)}`);
  }
  if (!VALID_DISTANCE.has(units.distance)) {
    errors.push(`Invalid units distance: ${String(units.distance)}`);
  }
  if (!VALID_ENERGY.has(units.energy)) {
    errors.push(`Invalid units energy: ${String(units.energy)}`);
  }
  if (units.system === "metric" && units.mass === "lb") {
    errors.push("Invalid units: metric system requires kg mass");
  }
  if (units.system === "imperial" && units.mass === "kg") {
    errors.push("Invalid units: imperial system requires lb mass");
  }
}

function validateTimeZone(
  timeZone: AthleteTimeZone | null | undefined,
  errors: string[],
): void {
  if (!timeZone) {
    errors.push("TimeZone is required");
    return;
  }
  if (!timeZone.iana) {
    errors.push("TimeZone iana is required");
  } else if (!isValidIanaTimeZone(timeZone.iana)) {
    errors.push(`Invalid timezone: ${timeZone.iana}`);
  }
  if (
    timeZone.offsetMinutes !== null &&
    (typeof timeZone.offsetMinutes !== "number" ||
      !Number.isFinite(timeZone.offsetMinutes) ||
      timeZone.offsetMinutes < -840 ||
      timeZone.offsetMinutes > 840)
  ) {
    errors.push(`Invalid timezone offsetMinutes: ${String(timeZone.offsetMinutes)}`);
  }
}

export interface ValidateIdentityOptions {
  readonly knownIdentityIds?: ReadonlySet<string>;
  readonly knownAthleteIds?: ReadonlySet<string>;
}

/**
 * Validates the immutable Athlete Identity.
 */
export function validateIdentity(
  identity: AthleteIdentity | null | undefined,
  options: ValidateIdentityOptions = {},
): AthleteIdentityValidation {
  const errors: string[] = [];

  if (!identity) {
    return Object.freeze({
      valid: false,
      errors: Object.freeze(["Athlete identity is missing"]),
    });
  }

  if (!identity.id) errors.push("Identity id is required");
  if (!identity.athleteId) errors.push("Identity athleteId is required");
  if (!identity.createdAt) errors.push("Identity createdAt is required");

  if (!identity.profile) {
    errors.push("Profile is required");
  } else if (!identity.profile.displayName) {
    errors.push("Profile displayName is required");
  }

  if (!identity.preferences) errors.push("Preferences are required");
  if (!identity.settings) errors.push("Settings are required");
  if (!identity.metadata) errors.push("Metadata is required");

  validateLocale(identity.locale, errors);
  validateUnits(identity.units, errors);
  validateTimeZone(identity.timeZone, errors);

  if (identity.metadata) {
    if (!identity.metadata.identityId) {
      errors.push("Metadata identityId is required");
    } else if (identity.metadata.identityId !== identity.id) {
      errors.push("Metadata identityId must match identity id");
    }
    if (!identity.metadata.generatedAt) {
      errors.push("Metadata generatedAt is required");
    }
    if (!identity.metadata.version) {
      errors.push("Metadata version is required");
    }
    if (!identity.metadata.schemaVersion) {
      errors.push("Metadata schemaVersion is required");
    }
  }

  if (
    identity.id &&
    options.knownIdentityIds?.has(identity.id)
  ) {
    errors.push(`Duplicate identity: ${identity.id}`);
  }
  if (
    identity.athleteId &&
    options.knownAthleteIds?.has(identity.athleteId)
  ) {
    errors.push(`Duplicate identity for athlete: ${identity.athleteId}`);
  }

  const requiredFrozen: Array<[string, unknown]> = [
    ["profile", identity.profile],
    ["preferences", identity.preferences],
    ["settings", identity.settings],
    ["locale", identity.locale],
    ["units", identity.units],
    ["timeZone", identity.timeZone],
    ["metadata", identity.metadata],
    ["identity", identity],
  ];
  for (const [name, value] of requiredFrozen) {
    if (value == null) {
      errors.push(`Null immutable field: ${name}`);
    } else if (!isFrozen(value)) {
      errors.push(`${name} must be immutable`);
    }
  }

  return Object.freeze({
    valid: errors.length === 0,
    errors: Object.freeze(errors),
  });
}

export function assertIdentityImmutable(identity: AthleteIdentity): void {
  if (!Object.isFrozen(identity)) {
    throw new Error("AthleteIdentity must be frozen");
  }
}

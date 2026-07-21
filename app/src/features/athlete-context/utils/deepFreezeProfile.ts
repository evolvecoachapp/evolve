import type { AthleteProfile } from "../models/AthleteProfile";

/**
 * Deep-freeze an AthleteProfile tree.
 *
 * Returns the same object reference after freezing nested plain objects.
 */
export function deepFreezeProfile(profile: AthleteProfile): AthleteProfile {
  return deepFreeze(profile) as AthleteProfile;
}

function deepFreeze<T>(value: T): T {
  if (value === null || typeof value !== "object") {
    return value;
  }

  const record = value as Record<string, unknown>;
  for (const key of Object.keys(record)) {
    const child = record[key];
    if (child !== null && typeof child === "object") {
      deepFreeze(child);
    }
  }

  return Object.freeze(value);
}

import type { AthleteTimeZone } from "../models/AthleteTimeZone";

export interface BuildTimeZoneInput {
  readonly iana: string;
  readonly offsetMinutes?: number | null;
  readonly displayName?: string | null;
}

/**
 * Builds an immutable AthleteTimeZone from an explicit IANA identifier.
 */
export function buildTimeZone(input: BuildTimeZoneInput): AthleteTimeZone {
  return Object.freeze({
    iana: input.iana.trim(),
    offsetMinutes:
      input.offsetMinutes === undefined ? null : input.offsetMinutes,
    displayName:
      input.displayName === undefined ? null : input.displayName,
  });
}

import type { AthleteProfile } from "../models/AthleteProfile";

export interface BuildProfileInput {
  readonly displayName: string;
  readonly givenName?: string | null;
  readonly familyName?: string | null;
  readonly sex?: string | null;
  readonly birthYear?: number | null;
  readonly experienceLevel?: string | null;
}

/**
 * Builds an immutable AthleteProfile.
 */
export function buildProfile(input: BuildProfileInput): AthleteProfile {
  return Object.freeze({
    displayName: input.displayName.trim(),
    givenName: input.givenName ?? null,
    familyName: input.familyName ?? null,
    sex: input.sex ?? null,
    birthYear: input.birthYear ?? null,
    experienceLevel: input.experienceLevel ?? null,
  });
}
